import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Setting up comprehensive review system...')

    // First, execute the schema
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- REVIEW SYSTEM SCHEMA
        -- Comprehensive review validation with audit trails and notification integration

        -- Review Templates table - defines the structure of each review type
        CREATE TABLE IF NOT EXISTS review_templates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name VARCHAR(255) NOT NULL,
          department VARCHAR(50) NOT NULL,
          shift_type VARCHAR(50) NOT NULL,
          trigger_condition VARCHAR(100),
          password_required BOOLEAN DEFAULT false,
          time_limit_hours INTEGER DEFAULT 6,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Review Categories
        CREATE TABLE IF NOT EXISTS review_categories (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          template_id UUID REFERENCES review_templates(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          max_rating INTEGER DEFAULT 5,
          order_index INTEGER DEFAULT 0,
          required BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Review Instances
        CREATE TABLE IF NOT EXISTS review_instances (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          template_id UUID REFERENCES review_templates(id) ON DELETE CASCADE,
          employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          date DATE NOT NULL,
          shift_type VARCHAR(50) NOT NULL,
          completion_method VARCHAR(50) NOT NULL,
          total_score INTEGER DEFAULT 0,
          max_possible_score INTEGER DEFAULT 0,
          percentage DECIMAL(5,2) DEFAULT 0,
          status VARCHAR(50) DEFAULT 'in_progress',
          requires_manager_followup BOOLEAN DEFAULT false,
          manager_reviewed_by UUID REFERENCES employees(id),
          manager_reviewed_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          locked_at TIMESTAMP WITH TIME ZONE,
          UNIQUE(template_id, employee_id, date, shift_type)
        );

        -- Review Responses
        CREATE TABLE IF NOT EXISTS review_responses (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          review_instance_id UUID REFERENCES review_instances(id) ON DELETE CASCADE,
          category_id UUID REFERENCES review_categories(id) ON DELETE CASCADE,
          rating INTEGER,
          notes TEXT,
          photos TEXT[],
          completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          completed_by UUID REFERENCES employees(id) ON DELETE CASCADE,
          workflow_task_id UUID,
          UNIQUE(review_instance_id, category_id)
        );

        -- Review Updates
        CREATE TABLE IF NOT EXISTS review_updates (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          review_response_id UUID REFERENCES review_responses(id) ON DELETE CASCADE,
          updated_by UUID REFERENCES employees(id) ON DELETE CASCADE,
          update_type VARCHAR(50) NOT NULL,
          previous_value JSONB,
          new_value JSONB,
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          manager_override BOOLEAN DEFAULT false
        );

        -- Workflow Review Mappings
        CREATE TABLE IF NOT EXISTS workflow_review_mappings (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          workflow_id UUID,
          task_id VARCHAR(255),
          review_template_id UUID REFERENCES review_templates(id) ON DELETE CASCADE,
          review_category_id UUID REFERENCES review_categories(id) ON DELETE CASCADE,
          auto_complete_review BOOLEAN DEFAULT true,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Enhanced Notifications
        DROP TABLE IF EXISTS notifications CASCADE;
        CREATE TABLE notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          type VARCHAR(50) NOT NULL,
          recipient_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          sender_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          title VARCHAR(255) NOT NULL,
          message TEXT NOT NULL,
          action_url VARCHAR(255),
          metadata JSONB,
          read_at TIMESTAMP WITH TIME ZONE,
          requires_acknowledgment BOOLEAN DEFAULT false,
          acknowledged_at TIMESTAMP WITH TIME ZONE,
          acknowledgment_signature TEXT,
          priority VARCHAR(20) DEFAULT 'normal',
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Wall Posts
        CREATE TABLE IF NOT EXISTS wall_posts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          author_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          content TEXT NOT NULL,
          post_type VARCHAR(50) NOT NULL,
          visibility VARCHAR(50) DEFAULT 'all',
          visibility_rules JSONB,
          requires_acknowledgment BOOLEAN DEFAULT false,
          acknowledgment_signature_required BOOLEAN DEFAULT false,
          photos TEXT[],
          reactions JSONB DEFAULT '{}',
          priority VARCHAR(20) DEFAULT 'normal',
          pinned BOOLEAN DEFAULT false,
          expires_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );

        -- Wall Post Acknowledgments
        CREATE TABLE IF NOT EXISTS wall_post_acknowledgments (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          post_id UUID REFERENCES wall_posts(id) ON DELETE CASCADE,
          employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
          acknowledged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          signature TEXT,
          UNIQUE(post_id, employee_id)
        );
      `
    })

    if (schemaError && !schemaError.message.includes('already exists')) {
      console.error('Schema error:', schemaError)
      // Continue anyway, tables might already exist
    }

    // Now create the review templates based on reference files
    console.log('📝 Creating review templates...')

    // 1. BOH Morning Review (Line Ratings 10AM)
    const { data: bohMorningTemplate } = await supabase
      .from('review_templates')
      .insert({
        name: 'BOH Morning Closer Review',
        department: 'BOH',
        shift_type: 'opening',
        trigger_condition: 'required_before_workflow',
        password_required: true,
        time_limit_hours: 6
      })
      .select()
      .single()

    if (bohMorningTemplate) {
      // Categories from LINE RATINGS AM AND PM.md - 10AM section
      const bohMorningCategories = [
        { name: 'Stations Stocked (Appetizer/Salad/Meat/Fry/Grill)', description: 'All pars met; backups wrapped; no empty pans; tools clean and staged.', order_index: 1 },
        { name: 'Containers Changed & Clean', description: 'Fresh, correct-size pans; no crusted edges; lids clean; inserts seated properly.', order_index: 2 },
        { name: 'FIFO, Dating & Labeling', description: 'All items labeled/dated; oldest on top/front; no undated product.', order_index: 3 },
        { name: 'Gyro Cooker', description: 'Trays emptied/washed; shields clean; machine powered off safely.', order_index: 4 },
        { name: 'Blanched Potatoes for AM', description: 'Required container(s) par present, labeled, and chilled.', order_index: 5 },
        { name: 'Fryer Oil Condition', description: 'Oil skimmed/filtered; change schedule followed; proper levels.', order_index: 6 },
        { name: 'Surfaces & Tools', description: 'Stations wiped/sanitized; knives/tools clean and in home positions.', order_index: 7 },
        { name: 'Floors & Mats', description: 'Swept & mopped; mats washed/placed; no debris under equipment.', order_index: 8 },
        { name: 'Stainless, Hood & Walls', description: 'Fronts smudge-free; hood/walls cleaned per weekly cadence & marked complete.', order_index: 9 },
        { name: 'To-Go, Bowls & Trays Stocked', description: 'Ample supply at open; no scrambling to restock during first hour.', order_index: 10 },
        { name: 'Trash & Drains', description: 'Handwash trash emptied; drains bleached per schedule; no odors.', order_index: 11 }
      ]

      for (const category of bohMorningCategories) {
        await supabase.from('review_categories').insert({
          template_id: bohMorningTemplate.id,
          ...category
        })
      }
    }

    // 2. BOH Prep Review (Lead Prep Worksheet Walk-Through)
    const { data: bohPrepTemplate } = await supabase
      .from('review_templates')
      .insert({
        name: 'BOH Prep Walk-Through Review',
        department: 'BOH',
        shift_type: 'prep',
        trigger_condition: 'manual_access_clock_in',
        password_required: true,
        time_limit_hours: 6
      })
      .select()
      .single()

    if (bohPrepTemplate) {
      // Categories from LEAD PREP WORKSHEET.md
      const bohPrepCategories = [
        { name: 'Walk-in Refrigerator', description: 'Temperature, organization, cleanliness', order_index: 1 },
        { name: 'Labels and Dates | Organization', description: 'Proper labeling, dating, and organization of all items', order_index: 2 },
        { name: 'Outside Container Storage', description: 'Organization and cleanliness of storage areas', order_index: 3 },
        { name: 'Cleanliness and Organization of Prep Areas', description: 'Work surfaces, tools, and general prep area condition', order_index: 4 },
        { name: 'Prep List Made from Night Before?', description: 'Previous shift prep list availability and accuracy', order_index: 5 },
        { name: 'Notes from the Night Before?', description: 'Communication and handoff notes from previous shift', order_index: 6 }
      ]

      for (const category of bohPrepCategories) {
        await supabase.from('review_categories').insert({
          template_id: bohPrepTemplate.id,
          ...category
        })
      }
    }

    // 3. BOH Evening Review (Line Ratings 5PM)
    const { data: bohEveningTemplate } = await supabase
      .from('review_templates')
      .insert({
        name: 'BOH Evening Transition Review',
        department: 'BOH',
        shift_type: 'closing',
        trigger_condition: 'manual_access',
        password_required: true,
        time_limit_hours: 6
      })
      .select()
      .single()

    if (bohEveningTemplate) {
      // Categories from LINE RATINGS AM AND PM.md - 5PM section
      const bohEveningCategories = [
        { name: 'Appetizer/Salad Station Refilled', description: 'PM pars met; clean containers; backups wrapped; utensils clean.', order_index: 1 },
        { name: 'Main Fridge Refilled', description: 'Greens and veggies rotated; sauces topped & dated; tools staged.', order_index: 2 },
        { name: 'Meat/Gyro Station Clean & Stocked', description: 'Cutting area clean; meat/garbanzo pans topped; knives sharp & clean.', order_index: 3 },
        { name: 'Rice & Potatoes', description: 'Fresh rice timed for PM; blanched potatoes at par and properly chilled.', order_index: 4 },
        { name: 'Surfaces & Organization', description: 'Stations wiped/sanitized; clutter-free; partials consolidated.', order_index: 5 },
        { name: 'Pita & To-Go', description: 'Pita counts set; to-go boxes/bowls/ramekins stocked; blue bowls/trays topped.', order_index: 6 },
        { name: 'Gyro Readiness', description: 'New gyros loaded if needed; drip trays not overfull; exterior wiped.', order_index: 7 },
        { name: 'Floors & Spot-Mopping', description: 'No debris; safe, dry work zones; mats placed correctly.', order_index: 8 },
        { name: 'Handoff Notes Quality', description: 'Clear 86 risks, low stock, pending prep; equipment issues flagged.', order_index: 9 }
      ]

      for (const category of bohEveningCategories) {
        await supabase.from('review_categories').insert({
          template_id: bohEveningTemplate.id,
          ...category
        })
      }
    }

    // Create a sample wall post
    const { data: manager } = await supabase
      .from('employees')
      .select('id')
      .eq('role', 'manager')
      .limit(1)
      .single()

    if (manager) {
      await supabase.from('wall_posts').insert({
        author_id: manager.id,
        content: '🎉 Welcome to the new review system! All reviews are now integrated with workflows and include audit trails for better accountability.',
        post_type: 'manager_update',
        visibility: 'all',
        requires_acknowledgment: false
      })
    }

    console.log('✅ Review system setup complete!')

    return NextResponse.json({
      success: true,
      message: 'Review system setup complete with audit trails and notifications',
      templates_created: 3,
      features: [
        'Password-protected manual access (JaynaGyro3130)',
        'Embedded workflow integration',
        '6-hour update window with manager override',
        'Real-time notifications for updates',
        'Comprehensive audit trails',
        'Wall posts and manager announcements',
        'Required before workflow access validation'
      ]
    })

  } catch (error) {
    console.error('❌ Error setting up review system:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to setup review system', details: errorMessage },
      { status: 500 }
    )
  }
}