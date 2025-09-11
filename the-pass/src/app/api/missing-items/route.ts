import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { 
      item_name,
      qty_needed,
      reason,
      urgency,
      employee_id,
      department,
      description,
      photo_url
    } = await request.json()
    
    if (!item_name || !employee_id || !department || !urgency) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: item_name, employee_id, department, urgency'
      }, { status: 400 })
    }

    // Verify employee exists
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id, name')
      .eq('id', employee_id)
      .single()

    if (employeeError || !employee) {
      return NextResponse.json({
        success: false,
        error: 'Employee not found'
      }, { status: 404 })
    }

    // Create missing item report
    const { data: report, error: reportError } = await supabase
      .from('missing_item_reports')
      .insert({
        item_name: item_name.trim(),
        reported_by: employee_id,
        department,
        priority: urgency,
        description: description || `${qty_needed} needed. ${reason || ''}`.trim(),
        photo_url,
        status: 'reported'
      })
      .select()
      .single()

    if (reportError) {
      console.error('Database error creating report:', reportError)
      return NextResponse.json({
        success: false,
        error: 'Failed to create missing item report',
        details: reportError.message
      }, { status: 500 })
    }

    // Auto-escalate urgent items
    let escalation_sent = false
    if (urgency === 'urgent' || urgency === 'high') {
      // In a real implementation, this would send SMS/notification to manager
      console.log(`🚨 URGENT MISSING ITEM ALERT:`, {
        item: item_name,
        employee: employee.name,
        department,
        urgency,
        report_id: report.id
      })
      escalation_sent = true
    }

    return NextResponse.json({
      success: true,
      report,
      employee_name: employee.name,
      escalation_sent,
      message: 'Missing item report submitted successfully'
    })

  } catch (error: any) {
    console.error('Error creating missing item report:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create missing item report',
      details: error.message
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const department = searchParams.get('department')
    const priority = searchParams.get('priority')
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('missing_item_reports')
      .select(`
        *,
        employees!inner(id, name, department)
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (status) {
      query = query.eq('status', status)
    }

    if (department) {
      query = query.eq('department', department)
    }

    if (priority) {
      query = query.eq('priority', priority)
    }

    const { data: reports, error } = await query

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch missing item reports',
        details: error.message
      }, { status: 500 })
    }

    // Group by status for dashboard
    const reportsByStatus = {
      reported: reports?.filter(r => r.status === 'reported') || [],
      ordered: reports?.filter(r => r.status === 'ordered') || [],
      resolved: reports?.filter(r => r.status === 'resolved') || []
    }

    return NextResponse.json({
      success: true,
      reports: reports || [],
      reports_by_status: reportsByStatus,
      total_count: reports?.length || 0,
      urgent_count: reports?.filter(r => r.priority === 'urgent' && r.status === 'reported').length || 0
    })

  } catch (error: any) {
    console.error('Error fetching missing item reports:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch missing item reports',
      details: error.message
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { report_id, status, notes } = await request.json()
    
    if (!report_id || !status) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: report_id and status'
      }, { status: 400 })
    }

    const validStatuses = ['reported', 'ordered', 'resolved']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid status. Must be: reported, ordered, or resolved'
      }, { status: 400 })
    }

    // Update report status
    const { data: updatedReport, error: updateError } = await supabase
      .from('missing_item_reports')
      .update({
        status,
        updated_at: new Date().toISOString(),
        ...(notes && { description: notes })
      })
      .eq('id', report_id)
      .select(`
        *,
        employees!inner(id, name)
      `)
      .single()

    if (updateError) {
      console.error('Database error updating report:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to update missing item report',
        details: updateError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      report: updatedReport,
      message: `Report status updated to ${status}`
    })

  } catch (error: any) {
    console.error('Error updating missing item report:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update missing item report',
      details: error.message
    }, { status: 500 })
  }
}
