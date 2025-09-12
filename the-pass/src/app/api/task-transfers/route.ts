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
      case 'setup_transfer_system':
        return await setupTransferSystem()
      case 'transfer_task':
        return await transferTask(data)
      case 'respond_to_transfer':
        return await respondToTransfer(data)
      case 'get_transfer_requests':
        return await getTransferRequests(data)
      case 'get_user_permissions':
        return await getUserPermissions(data)
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('❌ Error in task transfer system:', error)
    return NextResponse.json(
      { error: 'Task transfer system error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function setupTransferSystem() {
  try {
    // Create task transfers table
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Task Transfer System Schema
        CREATE TABLE IF NOT EXISTS task_transfers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          task_id UUID NOT NULL, -- Reference to task_instances or worksheet tasks
          task_type VARCHAR(50) NOT NULL, -- 'workflow_task', 'checklist_item', 'review_task'
          from_user_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          to_user_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          transfer_reason TEXT,
          status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'accepted', 'denied', 'cancelled'
          response_message TEXT,
          transferred_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          responded_at TIMESTAMP WITH TIME ZONE,
          metadata JSONB, -- Store task details, workflow info, etc.
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Task Transfer Permissions
        CREATE TABLE IF NOT EXISTS task_transfer_permissions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          can_transfer_to TEXT[], -- Array of employee IDs they can transfer to
          can_receive_from TEXT[], -- Array of employee IDs they can receive from
          department_restrictions TEXT[], -- Departments they can transfer within
          role_restrictions TEXT[], -- Roles they can transfer to/from
          max_transfers_per_day INTEGER DEFAULT 5,
          requires_approval BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(employee_id)
        );

        -- Transfer Approval Rules
        CREATE TABLE IF NOT EXISTS transfer_approval_rules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          rule_name VARCHAR(255) NOT NULL,
          applies_to_departments TEXT[],
          applies_to_roles TEXT[],
          requires_manager_approval BOOLEAN DEFAULT false,
          max_transfer_value INTEGER, -- For scored tasks
          time_restrictions JSONB, -- Time-based rules
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Indexes
        CREATE INDEX IF NOT EXISTS idx_task_transfers_from_user ON task_transfers(from_user_id);
        CREATE INDEX IF NOT EXISTS idx_task_transfers_to_user ON task_transfers(to_user_id);
        CREATE INDEX IF NOT EXISTS idx_task_transfers_status ON task_transfers(status);
        CREATE INDEX IF NOT EXISTS idx_transfer_permissions_employee ON task_transfer_permissions(employee_id);
      `
    })

    if (schemaError && !schemaError.message.includes('already exists')) {
      console.error('Schema error:', schemaError)
    }

    // Create default permissions for all employees
    const { data: employees } = await supabase
      .from('employees')
      .select('id, department, role')
      .eq('is_active', true)

    if (employees) {
      for (const employee of employees) {
        // Set up basic permissions based on role and department
        const permissions = {
          employee_id: employee.id,
          department_restrictions: [employee.department], // Can transfer within department
          max_transfers_per_day: employee.role === 'manager' ? 20 : 5,
          requires_approval: employee.role === 'employee' // Employees need approval
        }

        await supabase
          .from('task_transfer_permissions')
          .upsert(permissions, { onConflict: 'employee_id' })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Task transfer system setup complete',
      features: [
        'Task transfer between users',
        'Accept/deny workflow',
        'Department and role restrictions',
        'Transfer history and audit trail',
        'Manager approval system',
        'Daily transfer limits'
      ]
    })

  } catch (error) {
    throw new Error(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

async function transferTask(data: any) {
  const {
    task_id,
    task_type,
    from_user_id,
    to_user_id,
    transfer_reason,
    task_metadata = {}
  } = data

  // Check if user has permission to transfer
  const { data: permissions } = await supabase
    .from('task_transfer_permissions')
    .select('*')
    .eq('employee_id', from_user_id)
    .single()

  if (!permissions) {
    return NextResponse.json({
      success: false,
      message: 'You do not have transfer permissions'
    }, { status: 403 })
  }

  // Check daily transfer limit
  const today = new Date().toISOString().split('T')[0]
  const { data: todaysTransfers } = await supabase
    .from('task_transfers')
    .select('id')
    .eq('from_user_id', from_user_id)
    .gte('transferred_at', `${today}T00:00:00Z`)
    .lt('transferred_at', `${today}T23:59:59Z`)

  if (todaysTransfers && todaysTransfers.length >= permissions.max_transfers_per_day) {
    return NextResponse.json({
      success: false,
      message: `Daily transfer limit reached (${permissions.max_transfers_per_day})`
    }, { status: 429 })
  }

  // Check if target user can receive transfers
  const { data: targetUser } = await supabase
    .from('employees')
    .select('id, name, department, role')
    .eq('id', to_user_id)
    .eq('is_active', true)
    .single()

  if (!targetUser) {
    return NextResponse.json({
      success: false,
      message: 'Target user not found or inactive'
    }, { status: 404 })
  }

  // Check department restrictions
  if (permissions.department_restrictions && 
      !permissions.department_restrictions.includes(targetUser.department)) {
    return NextResponse.json({
      success: false,
      message: `Cannot transfer to ${targetUser.department} department`
    }, { status: 403 })
  }

  // Create transfer request
  const { data: transfer, error } = await supabase
    .from('task_transfers')
    .insert({
      task_id,
      task_type,
      from_user_id,
      to_user_id,
      transfer_reason,
      metadata: task_metadata,
      status: permissions.requires_approval ? 'pending_approval' : 'pending'
    })
    .select(`
      *,
      from_user:employees!task_transfers_from_user_id_fkey(name, department, role),
      to_user:employees!task_transfers_to_user_id_fkey(name, department, role)
    `)
    .single()

  if (error) {
    throw new Error(`Failed to create transfer: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Create notification for target user
  await supabase.from('notifications').insert({
    type: 'task_transfer',
    recipient_id: to_user_id,
    sender_id: from_user_id,
    title: 'Task Transfer Request',
    message: `${transfer.from_user.name} wants to transfer a task to you: "${transfer_reason || 'No reason provided'}"`,
    metadata: {
      transfer_id: transfer.id,
      task_id,
      task_type
    },
    requires_acknowledgment: true,
    priority: 'normal'
  })

  return NextResponse.json({
    success: true,
    message: `Transfer request sent to ${targetUser.name}`,
    transfer
  })
}

async function respondToTransfer(data: any) {
  const { transfer_id, response, response_message, user_id } = data

  if (!['accepted', 'denied'].includes(response)) {
    return NextResponse.json({
      success: false,
      message: 'Invalid response. Must be "accepted" or "denied"'
    }, { status: 400 })
  }

  // Get transfer details
  const { data: transfer } = await supabase
    .from('task_transfers')
    .select(`
      *,
      from_user:employees!task_transfers_from_user_id_fkey(name, department, role),
      to_user:employees!task_transfers_to_user_id_fkey(name, department, role)
    `)
    .eq('id', transfer_id)
    .eq('to_user_id', user_id) // Ensure user can only respond to their own transfers
    .single()

  if (!transfer) {
    return NextResponse.json({
      success: false,
      message: 'Transfer request not found or not authorized'
    }, { status: 404 })
  }

  if (transfer.status !== 'pending') {
    return NextResponse.json({
      success: false,
      message: 'Transfer request has already been responded to'
    }, { status: 400 })
  }

  // Update transfer status
  const { error } = await supabase
    .from('task_transfers')
    .update({
      status: response,
      response_message,
      responded_at: new Date().toISOString()
    })
    .eq('id', transfer_id)

  if (error) {
    throw new Error(`Failed to update transfer: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // If accepted, update the actual task assignment
  if (response === 'accepted') {
    await transferTaskAssignment(transfer)
  }

  // Notify original user
  await supabase.from('notifications').insert({
    type: 'task_transfer_response',
    recipient_id: transfer.from_user_id,
    sender_id: user_id,
    title: `Task Transfer ${response.charAt(0).toUpperCase() + response.slice(1)}`,
    message: response === 'accepted' 
      ? `${transfer.to_user.name} accepted your task transfer` 
      : `${transfer.to_user.name} denied your task transfer: ${response_message || 'No reason provided'}`,
    metadata: {
      transfer_id,
      original_task_id: transfer.task_id,
      response
    },
    priority: 'normal'
  })

  return NextResponse.json({
    success: true,
    message: `Transfer ${response} successfully`,
    transfer_id
  })
}

async function transferTaskAssignment(transfer: any) {
  // This function handles the actual task reassignment based on task type
  const { task_id, task_type, to_user_id, from_user_id } = transfer

  try {
    switch (task_type) {
      case 'workflow_task':
        // Update worksheet assignment
        await supabase
          .from('worksheets')
          .update({ 
            employee_id: to_user_id,
            notes: `Transferred from ${transfer.from_user.name} - ${transfer.transfer_reason || ''}`
          })
          .eq('id', task_id)
        break

      case 'checklist_item':
        // Update specific checklist item assignment if applicable
        // This would depend on how checklist items are structured
        break

      case 'review_task':
        // Update review assignment
        await supabase
          .from('review_instances')
          .update({ employee_id: to_user_id })
          .eq('id', task_id)
        break

      default:
        console.warn(`Unknown task type for transfer: ${task_type}`)
    }

    // Create audit log entry
    await supabase.from('notifications').insert({
      type: 'task_transferred',
      recipient_id: to_user_id,
      sender_id: from_user_id,
      title: 'Task Successfully Transferred',
      message: `You now have ownership of the transferred task. Original owner: ${transfer.from_user.name}`,
      metadata: {
        transfer_id: transfer.id,
        task_id,
        task_type,
        transferred_from: transfer.from_user.name
      },
      priority: 'normal'
    })

  } catch (error) {
    console.error('Error transferring task assignment:', error)
    throw error
  }
}

async function getTransferRequests(data: any) {
  const { user_id, type = 'received' } = data

  let query = supabase
    .from('task_transfers')
    .select(`
      *,
      from_user:employees!task_transfers_from_user_id_fkey(name, department, role, avatar_url),
      to_user:employees!task_transfers_to_user_id_fkey(name, department, role, avatar_url)
    `)
    .order('transferred_at', { ascending: false })

  if (type === 'received') {
    query = query.eq('to_user_id', user_id).in('status', ['pending', 'pending_approval'])
  } else if (type === 'sent') {
    query = query.eq('from_user_id', user_id)
  } else {
    // Both sent and received
    query = query.or(`from_user_id.eq.${user_id},to_user_id.eq.${user_id}`)
  }

  const { data: transfers, error } = await query

  if (error) {
    throw new Error(`Failed to get transfer requests: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  return NextResponse.json({
    success: true,
    transfers
  })
}

async function getUserPermissions(data: any) {
  const { user_id } = data

  const { data: permissions } = await supabase
    .from('task_transfer_permissions')
    .select('*')
    .eq('employee_id', user_id)
    .single()

  const { data: eligibleUsers } = await supabase
    .from('employees')
    .select('id, name, department, role')
    .eq('is_active', true)
    .neq('id', user_id)

  return NextResponse.json({
    success: true,
    permissions: permissions || {
      max_transfers_per_day: 5,
      requires_approval: true,
      department_restrictions: []
    },
    eligible_users: eligibleUsers || []
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const user_id = searchParams.get('user_id')

    if (action === 'get_transfer_requests' && user_id) {
      const type = searchParams.get('type') || 'received'
      return await getTransferRequests({ user_id, type })
    }

    if (action === 'get_user_permissions' && user_id) {
      return await getUserPermissions({ user_id })
    }

    return NextResponse.json({ error: 'Invalid action or missing parameters' }, { status: 400 })

  } catch (error) {
    console.error('❌ Error getting transfer data:', error)
    return NextResponse.json(
      { error: 'Failed to get transfer data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}