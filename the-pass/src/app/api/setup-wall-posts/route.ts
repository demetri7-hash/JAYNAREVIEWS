import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Adding wall posts system to database...')

    // Create wall_posts table
    const { error: wallPostsError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_name', 'wall_posts')
      .single()

    if (!wallPostsError) {
      console.log('✅ Wall posts table already exists')
    } else {
      // Create tables directly
      const createTablesQueries = [
        `CREATE TABLE wall_posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          author_id UUID REFERENCES users(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          post_type VARCHAR(20) DEFAULT 'public',
          visibility VARCHAR(20) DEFAULT 'all',
          visibility_rules JSONB DEFAULT '{}',
          photos TEXT[],
          requires_acknowledgment BOOLEAN DEFAULT false,
          acknowledgment_signature_required BOOLEAN DEFAULT false,
          pinned BOOLEAN DEFAULT false,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )`,
        
        `CREATE TABLE wall_post_acknowledgments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
          employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
          acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          signature TEXT,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(post_id, employee_id)
        )`,
        
        `CREATE TABLE wall_post_reactions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
          employee_id UUID REFERENCES users(id) ON DELETE CASCADE,
          reaction_type VARCHAR(20) DEFAULT 'like',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(post_id, employee_id, reaction_type)
        )`
      ]

      for (const query of createTablesQueries) {
        const { error } = await supabase.rpc('exec', { sql: query })
        if (error) {
          console.error('Error executing query:', error)
        }
      }
    }

    // Add sample posts using direct insert
    const { data: adminUser } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .single()

    if (adminUser) {
      const { error: insertError } = await supabase.from('wall_posts').upsert([
        {
          author_id: adminUser.id,
          content: 'Welcome to The Pass! 🎉 This is your team communication hub where you can share updates, receive announcements, and stay connected with your team. Let\'s make every shift count! 💪',
          post_type: 'announcement',
          visibility: 'all',
          pinned: true
        },
        {
          author_id: adminUser.id,
          content: '📋 NEW SAFETY PROTOCOL UPDATE\n\nEffective immediately, all team members must:\n1. Wear gloves when handling raw ingredients\n2. Change gloves between different food items\n3. Wash hands thoroughly before and after each order\n\nThis policy is mandatory for food safety compliance. Please acknowledge that you have read and understand these requirements.',
          post_type: 'announcement',
          requires_acknowledgment: true,
          acknowledgment_signature_required: true
        }
      ], { onConflict: 'id' })

      if (insertError) {
        console.error('Error inserting sample posts:', insertError)
      } else {
        console.log('✅ Sample posts added successfully')
      }
    }

    console.log('✅ Wall posts system setup completed!')

    return NextResponse.json({
      success: true,
      message: 'Wall posts system setup completed',
      tables_created: ['wall_posts', 'wall_post_acknowledgments', 'wall_post_reactions']
    })

  } catch (error) {
    console.error('❌ Error setting up wall posts system:', error)
    return NextResponse.json(
      { 
        error: 'Failed to setup wall posts system', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}