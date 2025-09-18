import { NextResponse } from 'next/server'
import { ToastAPIClient } from '../../../lib/integrations/toast-api-working'

interface ToastEmployee {
  guid: string
  firstName?: string
  lastName?: string
  email?: string
  jobTitle?: string
  phoneNumber?: string
  externalId?: string
  deleted?: boolean
}

interface TransformedEmployee {
  id: string
  name: string
  email: string
  jobTitle: string
  phoneNumber: string
  externalId: string
  isActive: boolean
}

export async function GET() {
  try {
    console.log('🔄 Fetching TOAST employees for linking...')
    
    const toastClient = new ToastAPIClient({
      clientId: process.env.TOAST_API_KEY!,
      clientSecret: process.env.TOAST_CLIENT_SECRET!,
      restaurantId: process.env.TOAST_RESTAURANT_ID!,
      baseURL: process.env.TOAST_BASE_URL!
    })
    
    // Initialize authentication
    await toastClient.authenticate()
    
    // Get employee data
    const employees = await toastClient.getEmployees()
    
    console.log(`✅ Found ${employees.length} TOAST employees`)
    
    // Transform the data for easier use in dropdowns
    const employeeList: TransformedEmployee[] = employees.map((emp: ToastEmployee) => ({
      id: emp.guid,
      name: `${emp.firstName || ''} ${emp.lastName || ''}`.trim(),
      email: emp.email || '',
      jobTitle: emp.jobTitle || '',
      phoneNumber: emp.phoneNumber || '',
      externalId: emp.externalId || '',
      isActive: !emp.deleted
    })).filter((emp: TransformedEmployee) => emp.name && emp.isActive)

    // Sort by name for better UX
    employeeList.sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({
      success: true,
      employees: employeeList,
      totalCount: employees.length,
      activeCount: employeeList.length
    })

  } catch (error) {
    console.error('TOAST employees fetch error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch TOAST employee data',
      employees: [],
      totalCount: 0,
      activeCount: 0
    }, { status: 500 })
  }
}