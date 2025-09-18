import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Setting up basic employee management...')

    // First, create your profile manually
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'demetri7@gmail.com')
      .single()

    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Profile check error:', profileCheckError)
    }

    if (!existingProfile) {
      // Create your profile
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          email: 'demetri7@gmail.com',
          name: 'Demetri Gregorakis',
          role: 'manager'
        })

      if (createProfileError) {
        console.error('Create profile error:', createProfileError)
      } else {
        console.log('✅ Profile created for demetri7@gmail.com')
      }
    } else {
      console.log('✅ Profile already exists')
    }

    // Get all profiles to show current state
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      console.error('Profiles error:', profilesError)
    } else {
      console.log('Current profiles:', profiles?.length || 0)
    }

    return NextResponse.json({
      success: true,
      profiles: profiles || [],
      message: 'Basic setup complete'
    })

  } catch (error) {
    console.error('Setup error:', error)
    return NextResponse.json({
      success: false,
      error: 'Setup failed'
    }, { status: 500 })
  }
}