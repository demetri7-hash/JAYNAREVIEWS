import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { createClient } from '@supabase/supabase-js'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const taskId = formData.get('task_id') as string
    const worksheetId = formData.get('worksheet_id') as string

    if (!file || !taskId || !worksheetId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Get employee
    const { data: employee } = await supabase
      .from('employees')
      .select('id, role')
      .eq('email', session.user.email)
      .single()

    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 })
    }

    // Verify access to worksheet
    const { data: worksheet } = await supabase
      .from('worksheets')
      .select('employee_id')
      .eq('id', worksheetId)
      .single()

    if (!worksheet) {
      return NextResponse.json({ error: 'Worksheet not found' }, { status: 404 })
    }

    const isOwner = worksheet.employee_id === employee.id
    const isManagerOrAdmin = ['manager', 'admin'].includes(employee.role)

    if (!isOwner && !isManagerOrAdmin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'worksheets', worksheetId)
    await mkdir(uploadsDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const extension = file.name.split('.').pop()
    const filename = `task_${taskId}_${timestamp}.${extension}`
    const filepath = join(uploadsDir, filename)

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Generate URL
    const photoUrl = `/uploads/worksheets/${worksheetId}/${filename}`

    // Save photo record to database (optional - for tracking)
    const { error: insertError } = await supabase
      .from('worksheet_photos')
      .insert({
        worksheet_id: worksheetId,
        task_id: parseInt(taskId),
        employee_id: employee.id,
        filename: filename,
        file_path: photoUrl,
        file_size: file.size,
        mime_type: file.type,
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error saving photo record:', insertError)
      // Don't fail the request if we can't save the record
    }

    return NextResponse.json({ 
      success: true, 
      photo_url: photoUrl,
      filename: filename
    })
  } catch (error) {
    console.error('Error uploading photo:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
