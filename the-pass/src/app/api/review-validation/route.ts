import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const REVIEW_PASSWORD = 'JaynaGyro3130'

export async function POST(request: NextRequest) {
  try {
    const { action, password, employee_id, template_id, date, shift_type, responses, manager_override } = await request.json()

    switch (action) {
      case 'validate_password':
        return NextResponse.json({
          success: password === REVIEW_PASSWORD,
          message: password === REVIEW_PASSWORD ? 'Access granted' : 'Invalid password'
        })

      case 'get_review_status':
        // Check if review exists and its completion status
        const { data: existingReviewInstance } = await supabase
          .from('review_instances')
          .select(`
            *,
            review_responses(
              id,
              category_id,
              rating,
              notes,
              photos,
              completed_at,
              review_categories(name, description, max_rating)
            )
          `)
          .eq('template_id', template_id)
          .eq('employee_id', employee_id)
          .eq('date', date)
          .eq('shift_type', shift_type)
          .single()

        const { data: template } = await supabase
          .from('review_templates')
          .select(`
            *,
            review_categories(*)
          `)
          .eq('id', template_id)
          .single()

        return NextResponse.json({
          success: true,
          review_instance: existingReviewInstance,
          template: template,
          can_update: existingReviewInstance ? 
            (existingReviewInstance.locked_at === null || new Date() < new Date(existingReviewInstance.locked_at)) : 
            true
        })

      case 'submit_review':
        // Create or update review instance
        let reviewInstance
        const { data: existingReview } = await supabase
          .from('review_instances')
          .select('*')
          .eq('template_id', template_id)
          .eq('employee_id', employee_id)
          .eq('date', date)
          .eq('shift_type', shift_type)
          .single()

        if (existingReview) {
          // Check if still within update window or manager override
          const canUpdate = existingReview.locked_at === null || 
                          new Date() < new Date(existingReview.locked_at) ||
                          manager_override

          if (!canUpdate) {
            return NextResponse.json({
              success: false,
              message: 'Review update window has expired. Contact a manager to make changes.'
            }, { status: 403 })
          }

          reviewInstance = existingReview
        } else {
          // Create new review instance
          const lockTime = new Date()
          lockTime.setHours(lockTime.getHours() + 6) // 6-hour update window

          const { data: newReview } = await supabase
            .from('review_instances')
            .insert({
              template_id,
              employee_id,
              date,
              shift_type,
              completion_method: 'manual',
              locked_at: lockTime.toISOString()
            })
            .select()
            .single()

          reviewInstance = newReview
        }

        // Process responses
        let totalScore = 0
        let maxPossibleScore = 0
        let hasLowRatings = false

        for (const response of responses) {
          const { category_id, rating, notes, photos } = response

          // Get max rating for this category
          const { data: category } = await supabase
            .from('review_categories')
            .select('max_rating')
            .eq('id', category_id)
            .single()

          maxPossibleScore += category?.max_rating || 5
          totalScore += rating || 0

          if (rating === 1) hasLowRatings = true

          // Check if response already exists
          const { data: existingResponse } = await supabase
            .from('review_responses')
            .select('*')
            .eq('review_instance_id', reviewInstance.id)
            .eq('category_id', category_id)
            .single()

          if (existingResponse) {
            // Create update record for audit trail
            await supabase.from('review_updates').insert({
              review_response_id: existingResponse.id,
              updated_by: employee_id,
              update_type: 'response_updated',
              previous_value: {
                rating: existingResponse.rating,
                notes: existingResponse.notes,
                photos: existingResponse.photos
              },
              new_value: { rating, notes, photos },
              manager_override: manager_override || false
            })

            // Update the response
            await supabase
              .from('review_responses')
              .update({
                rating,
                notes,
                photos,
                completed_at: new Date().toISOString(),
                completed_by: employee_id
              })
              .eq('id', existingResponse.id)
          } else {
            // Create new response
            await supabase.from('review_responses').insert({
              review_instance_id: reviewInstance.id,
              category_id,
              rating,
              notes,
              photos,
              completed_by: employee_id
            })
          }
        }

        // Update review instance totals
        const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0
        
        await supabase
          .from('review_instances')
          .update({
            total_score: totalScore,
            max_possible_score: maxPossibleScore,
            percentage: percentage,
            status: 'completed',
            requires_manager_followup: hasLowRatings || percentage < 85,
            updated_at: new Date().toISOString()
          })
          .eq('id', reviewInstance.id)

        // Send notification to managers if review updated or requires follow-up
        if (existingReview || hasLowRatings || percentage < 85) {
          const { data: managers } = await supabase
            .from('employees')
            .select('id')
            .eq('role', 'manager')

          const { data: employee } = await supabase
            .from('employees')
            .select('name')
            .eq('id', employee_id)
            .single()

          const notificationTitle = existingReview ? 
            `Review Updated: ${employee?.name}` : 
            `Review Completed: ${employee?.name}`

          const notificationMessage = hasLowRatings || percentage < 85 ?
            `Review score: ${percentage.toFixed(1)}% - Requires manager follow-up` :
            `Review score: ${percentage.toFixed(1)}% - Review updated after completion`

          for (const manager of managers || []) {
            await supabase.from('notifications').insert({
              type: 'review_update',
              recipient_id: manager.id,
              sender_id: employee_id,
              title: notificationTitle,
              message: notificationMessage,
              metadata: {
                review_instance_id: reviewInstance.id,
                score: percentage,
                requires_followup: hasLowRatings || percentage < 85
              },
              priority: hasLowRatings ? 'high' : 'normal'
            })
          }
        }

        return NextResponse.json({
          success: true,
          message: 'Review submitted successfully',
          review_instance_id: reviewInstance.id,
          total_score: totalScore,
          max_possible_score: maxPossibleScore,
          percentage: percentage,
          requires_manager_followup: hasLowRatings || percentage < 85
        })

      case 'check_workflow_requirements':
        // Check if required reviews are completed before allowing workflow access
        const { workflow_department, workflow_shift } = await request.json()
        
        const today = new Date().toISOString().split('T')[0]
        
        // Get required review templates for this workflow
        const requiredReviews = []
        
        if (workflow_department === 'BOH' && workflow_shift === 'opening') {
          requiredReviews.push('BOH Morning Closer Review')
        }
        if (workflow_department === 'BOH' && workflow_shift === 'closing') {
          requiredReviews.push('BOH Evening Transition Review')
        }

        const incompletReviews = []
        
        for (const reviewName of requiredReviews) {
          const { data: template } = await supabase
            .from('review_templates')
            .select('id')
            .eq('name', reviewName)
            .single()

          if (template) {
            const { data: completed } = await supabase
              .from('review_instances')
              .select('id')
              .eq('template_id', template.id)
              .eq('employee_id', employee_id)
              .eq('date', today)
              .eq('status', 'completed')
              .single()

            if (!completed) {
              incompletReviews.push(reviewName)
            }
          }
        }

        return NextResponse.json({
          success: true,
          workflow_allowed: incompletReviews.length === 0,
          incomplete_reviews: incompletReviews,
          message: incompletReviews.length > 0 ? 
            `Please complete required reviews: ${incompletReviews.join(', ')}` :
            'All required reviews completed - workflow access granted'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('❌ Error in review validation:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: 'Review validation failed', details: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const employee_id = searchParams.get('employee_id')
    
    if (!employee_id) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 })
    }

    // Get all review templates with completion status for today
    const today = new Date().toISOString().split('T')[0]
    
    const { data: templates } = await supabase
      .from('review_templates')
      .select(`
        *,
        review_categories(*),
        review_instances!inner(
          id,
          status,
          percentage,
          requires_manager_followup,
          created_at,
          updated_at,
          locked_at
        )
      `)
      .eq('review_instances.employee_id', employee_id)
      .eq('review_instances.date', today)

    const { data: allTemplates } = await supabase
      .from('review_templates')
      .select(`
        *,
        review_categories(*)
      `)

    // Merge completed and available templates
    const reviewStatus = allTemplates?.map(template => {
      const completed = templates?.find(t => t.id === template.id)
      return {
        ...template,
        completed: !!completed,
        instance: completed?.review_instances?.[0] || null
      }
    })

    return NextResponse.json({
      success: true,
      reviews: reviewStatus
    })

  } catch (error) {
    console.error('❌ Error getting review status:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    return NextResponse.json(
      { error: 'Failed to get review status', details: errorMessage },
      { status: 500 }
    )
  }
}