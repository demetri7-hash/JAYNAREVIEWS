import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Trigger the archive process
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/archive-week`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Archive process triggered successfully',
      result
    })

  } catch (error) {
    console.error('Error triggering archive:', error)
    return NextResponse.json(
      { error: 'Failed to trigger archive process' },
      { status: 500 }
    )
  }
}