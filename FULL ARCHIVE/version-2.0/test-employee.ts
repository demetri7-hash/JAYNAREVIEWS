import { supabase } from '@/lib/supabase'

export default async function TestEmployeeCreation() {
  const testEmployee = {
    name: 'Test User',
    email: 'test@test.com',
    department: 'FOH' as const,
    role: 'employee',
    is_active: true,
    status: 'online',
    language: 'en' as const
  }

  try {
    console.log('Creating employee with:', testEmployee)
    
    const { data, error } = await supabase
      .from('employees')
      .insert(testEmployee)
      .select()
      .single()

    console.log('Result:', { data, error })
    
    if (error) {
      console.error('Error details:', error)
      return { success: false, error: error.message, details: error }
    }
    
    return { success: true, data }
  } catch (err) {
    console.error('Exception:', err)
    return { success: false, error: 'Exception occurred', details: err }
  }
}
