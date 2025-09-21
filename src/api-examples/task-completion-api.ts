// Example API route for handling task completion with photos and notes
// File: /api/tasks/[id]/complete/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import path from 'path'
import { nanoid } from 'nanoid'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formData = await request.formData()
    const taskId = params.id
    const notes = formData.get('notes') as string
    const photos = formData.getAll('photos') as File[]

    // Validate task exists and is not already completed
    const task = await getTaskById(taskId)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }

    if (task.status === 'completed') {
      return NextResponse.json({ error: 'Task already completed' }, { status: 400 })
    }

    // Validate requirements
    if (task.requires_notes && (!notes || !notes.trim())) {
      return NextResponse.json({ 
        error: 'Notes are required for this task' 
      }, { status: 400 })
    }

    if (task.requires_photo && photos.length === 0) {
      return NextResponse.json({ 
        error: 'Photo is required for this task' 
      }, { status: 400 })
    }

    // Process photo uploads
    const uploadedPhotos = []
    for (const photo of photos) {
      if (photo.size > 0) {
        const bytes = await photo.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const extension = path.extname(photo.name)
        const filename = `task-${taskId}-${nanoid()}${extension}`
        const uploadPath = path.join(process.cwd(), 'public/uploads/task-photos', filename)

        // Save file
        await writeFile(uploadPath, buffer)

        // Store photo record
        const photoRecord = await createTaskPhoto({
          task_id: taskId,
          filename: photo.name,
          stored_filename: filename,
          file_path: `/uploads/task-photos/${filename}`,
          file_size: photo.size,
          mime_type: photo.type
        })

        uploadedPhotos.push(photoRecord)
      }
    }

    // Complete the task
    const completion = await completeTask({
      task_id: taskId,
      completed_by: getCurrentUserId(), // Get from session
      notes: notes?.trim() || null,
      photos: uploadedPhotos
    })

    return NextResponse.json({
      success: true,
      completion,
      message: 'Task completed successfully'
    })

  } catch (error) {
    console.error('Error completing task:', error)
    return NextResponse.json({ 
      error: 'Failed to complete task' 
    }, { status: 500 })
  }
}

// Database helper functions (implement based on your database)
async function getTaskById(id: string) {
  // Implementation depends on your database
  // Should return task with requires_photo and requires_notes fields
}

async function createTaskPhoto(photoData: {
  task_id: string
  filename: string
  stored_filename: string
  file_path: string
  file_size: number
  mime_type: string
}) {
  // Implementation depends on your database
  // Should store photo metadata and return photo record
}

async function completeTask(completionData: {
  task_id: string
  completed_by: string
  notes: string | null
  photos: any[]
}) {
  // Implementation depends on your database
  // Should mark task as completed and store completion data
}

function getCurrentUserId() {
  // Get user ID from session/auth
  // Implementation depends on your auth system
}