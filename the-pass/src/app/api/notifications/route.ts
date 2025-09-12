import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    switch (action) {
      case 'create_wall_post':
        return await createWallPost(data)
      case 'create_manager_update':
        return await createManagerUpdate(data)
      case 'acknowledge_post':
        return await acknowledgePost(data)
      case 'get_notifications':
        return await getNotifications(data)
      case 'mark_notification_read':
        return await markNotificationRead(data)
      case 'create_notification':
        return await createNotification(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Error in notification system:', error)
    return NextResponse.json(
      { error: 'Notification system error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function createWallPost(data: any) {
  const { 
    author_id, 
    content, 
    post_type = 'public', 
    visibility = 'all',
    visibility_rules = {},
    photos = [],
    requires_acknowledgment = false,
    acknowledgment_signature_required = false,
    pinned = false,
    expires_at = null
  } = data

  const { data: post, error } = await supabase
    .from('wall_posts')
    .insert({
      author_id,
      content,
      post_type,
      visibility,
      visibility_rules,
      photos,
      requires_acknowledgment,
      acknowledgment_signature_required,
      pinned,
      expires_at
    })
    .select(`
      *,
      employees!wall_posts_author_id_fkey(name, role, department)
    `)
    .single()

  if (error) {
    throw new Error(`Failed to create wall post: ${error.message}`)
  }

  // Create notifications for relevant users if it's a manager update
  if (post_type === 'manager_update') {
    await notifyRelevantUsers(post, visibility, visibility_rules)
  }

  return NextResponse.json({
    success: true,
    message: 'Wall post created successfully',
    post
  })
}

async function createManagerUpdate(data: any) {
  const {
    author_id,
    title,
    content,
    target_users = 'all', // 'all', 'department', 'role', 'specific'
    target_department = null,
    target_role = null,
    specific_user_ids = [],
    requires_acknowledgment = false,
    acknowledgment_signature_required = false,
    priority = 'normal',
    expires_at = null
  } = data

  // Create wall post
  const visibility_rules = {
    target_users,
    target_department,
    target_role,
    specific_user_ids
  }

  const { data: post } = await supabase
    .from('wall_posts')
    .insert({
      author_id,
      content: `**${title}**\n\n${content}`,
      post_type: 'manager_update',
      visibility: target_users,
      visibility_rules,
      requires_acknowledgment,
      acknowledgment_signature_required,
      priority,
      expires_at
    })
    .select()
    .single()

  // Create individual notifications
  let targetUsers: any[] = []
  
  if (target_users === 'all') {
    const { data: allUsers } = await supabase
      .from('employees')
      .select('id')
      .eq('is_active', true)
    targetUsers = allUsers || []
  } else if (target_users === 'department' && target_department) {
    const { data: deptUsers } = await supabase
      .from('employees')
      .select('id')
      .eq('department', target_department)
      .eq('is_active', true)
    targetUsers = deptUsers || []
  } else if (target_users === 'role' && target_role) {
    const { data: roleUsers } = await supabase
      .from('employees')
      .select('id')
      .eq('role', target_role)
      .eq('is_active', true)
    targetUsers = roleUsers || []
  } else if (target_users === 'specific' && specific_user_ids.length > 0) {
    const { data: specificUsers } = await supabase
      .from('employees')
      .select('id')
      .in('id', specific_user_ids)
      .eq('is_active', true)
    targetUsers = specificUsers || []
  }

  // Create notifications for each target user
  const notifications = targetUsers.map(user => ({
    type: 'manager_update',
    recipient_id: user.id,
    sender_id: author_id,
    title,
    message: content,
    metadata: {
      post_id: post.id,
      requires_acknowledgment,
      acknowledgment_signature_required
    },
    requires_acknowledgment,
    priority
  }))

  if (notifications.length > 0) {
    await supabase.from('notifications').insert(notifications)
  }

  return NextResponse.json({
    success: true,
    message: 'Manager update created successfully',
    post,
    notifications_sent: notifications.length
  })
}

async function acknowledgePost(data: any) {
  const { post_id, employee_id, signature = null } = data

  // Check if post requires signature
  const { data: post } = await supabase
    .from('wall_posts')
    .select('acknowledgment_signature_required')
    .eq('id', post_id)
    .single()

  if (post?.acknowledgment_signature_required && !signature) {
    return NextResponse.json({
      success: false,
      message: 'Full name signature required for acknowledgment'
    }, { status: 400 })
  }

  // Create acknowledgment
  const { error } = await supabase
    .from('wall_post_acknowledgments')
    .insert({
      post_id,
      employee_id,
      signature
    })

  if (error && !error.message.includes('duplicate key')) {
    throw new Error(`Failed to acknowledge post: ${error.message}`)
  }

  // Update notification as acknowledged
  await supabase
    .from('notifications')
    .update({
      acknowledged_at: new Date().toISOString(),
      acknowledgment_signature: signature
    })
    .eq('metadata->>post_id', post_id)
    .eq('recipient_id', employee_id)

  return NextResponse.json({
    success: true,
    message: 'Post acknowledged successfully'
  })
}

async function getNotifications(data: any) {
  const { employee_id, include_read = false, limit = 50 } = data

  let query = supabase
    .from('notifications')
    .select(`
      *,
      sender:employees!notifications_sender_id_fkey(name, role),
      wall_posts(content, post_type, requires_acknowledgment)
    `)
    .eq('recipient_id', employee_id)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (!include_read) {
    query = query.is('read_at', null)
  }

  const { data: notifications, error } = await query

  if (error) {
    throw new Error(`Failed to get notifications: ${error.message}`)
  }

  return NextResponse.json({
    success: true,
    notifications
  })
}

async function markNotificationRead(data: any) {
  const { notification_id, employee_id } = data

  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notification_id)
    .eq('recipient_id', employee_id)

  if (error) {
    throw new Error(`Failed to mark notification as read: ${error.message}`)
  }

  return NextResponse.json({
    success: true,
    message: 'Notification marked as read'
  })
}

async function createNotification(data: any) {
  const {
    type,
    recipient_id,
    sender_id,
    title,
    message,
    action_url = null,
    metadata = {},
    requires_acknowledgment = false,
    priority = 'normal',
    expires_at = null
  } = data

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      type,
      recipient_id,
      sender_id,
      title,
      message,
      action_url,
      metadata,
      requires_acknowledgment,
      priority,
      expires_at
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create notification: ${error.message}`)
  }

  return NextResponse.json({
    success: true,
    message: 'Notification created successfully',
    notification
  })
}

async function notifyRelevantUsers(post: any, visibility: string, visibility_rules: any) {
  // This function creates notifications based on post visibility rules
  // Implementation would depend on the specific visibility logic
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const employee_id = searchParams.get('employee_id')
    const userId = searchParams.get('userId')

    if (action === 'get_unread_count' && userId) {
      // Get unread notifications count
      const { data: unreadNotifications, error } = await supabase
        .from('user_notifications')
        .select('id')
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        throw new Error(`Failed to get notifications: ${error.message}`)
      }

      return NextResponse.json({
        success: true,
        unreadCount: unreadNotifications?.length || 0
      })
    }

    if (action === 'get_wall_posts') {
      const post_type = searchParams.get('post_type') || 'all'
      const limit = parseInt(searchParams.get('limit') || '20')

      let query = supabase
        .from('wall_posts')
        .select(`
          *,
          author:employees!wall_posts_author_id_fkey(name, role, department, avatar_url),
          wall_post_acknowledgments(employee_id, acknowledged_at, signature),
          _count_acknowledgments:wall_post_acknowledgments(count)
        `)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (post_type !== 'all') {
        query = query.eq('post_type', post_type)
      }

      // Filter based on visibility if employee_id provided
      if (employee_id) {
        // Add visibility filtering logic here
      }

      const { data: posts, error } = await query

      if (error) {
        throw new Error(`Failed to get wall posts: ${error.message}`)
      }

      return NextResponse.json({
        success: true,
        posts
      })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('❌ Error getting data:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to get data', details: errorMessage },
      { status: 500 }
    )
  }
}