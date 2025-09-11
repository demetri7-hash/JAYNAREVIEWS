import { NextRequest, NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        
        // Debug: Check if service key is available
        console.log('Service key available:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)
        
        // Use admin client for user creation to bypass RLS
        const client = supabaseAdmin || supabase
        console.log('Using admin client:', !!supabaseAdmin)
        
        // Create user in employees table
        const { data: employee, error: employeeError } = await client
            .from('employees')
            .insert({
                name: body.name,
                email: body.email,
                department: body.department,
                role: body.role,
                is_active: true,
                status: 'online',
                language: 'en'
            })
            .select('*')
            .single()

        if (employeeError) {
            throw employeeError
        }

        return NextResponse.json({
            success: true,
            user: employee
        })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}

export async function GET() {
    try {
        // Test getting all employees
        const { data: employees, error } = await supabase
            .from('employees')
            .select('*')
            .limit(10)

        if (error) throw error

        return NextResponse.json({
            success: true,
            employees: employees || []
        })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({
            success: false,
            error: error.message
        }, { status: 500 })
    }
}
