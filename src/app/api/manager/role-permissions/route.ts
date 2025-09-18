import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET: Fetch role permissions
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a manager
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!userProfile || !['manager', 'kitchen_manager', 'ordering_manager', 'assistant_foh_manager'].includes(userProfile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Fetch role permissions from database
    const { data: rolePermissions, error } = await supabase
      .from('role_permissions')
      .select('role, department');

    if (error) {
      console.error('Error fetching role permissions:', error);
      return NextResponse.json({ error: 'Failed to fetch role permissions' }, { status: 500 });
    }

    // Group permissions by role
    const permissions: Record<string, string[]> = {
      staff: [],
      foh_team_member: [],
      boh_team_member: [],
      kitchen_manager: [],
      ordering_manager: [],
      lead_prep_cook: [],
      assistant_foh_manager: [],
      manager: [],
    };

    rolePermissions?.forEach(({ role, department }) => {
      if (permissions[role]) {
        permissions[role].push(department);
      }
    });

    return NextResponse.json({ permissions });
  } catch (error) {
    console.error('Error in GET /api/manager/role-permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PATCH: Update role permissions  
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is a manager
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('role')
      .eq('email', session.user.email)
      .single();

    if (!userProfile || userProfile.role !== 'manager') {
      return NextResponse.json({ error: 'Only managers can modify role permissions' }, { status: 403 });
    }

    const { role, departments } = await request.json();

    if (!role || !Array.isArray(departments)) {
      return NextResponse.json({ error: 'Missing role or departments array' }, { status: 400 });
    }

    // First, delete existing permissions for this role
    const { error: deleteError } = await supabase
      .from('role_permissions')
      .delete()
      .eq('role', role);

    if (deleteError) {
      console.error('Error deleting existing permissions:', deleteError);
      return NextResponse.json({ error: 'Failed to update role permissions' }, { status: 500 });
    }

    // Then, insert new permissions
    if (departments.length > 0) {
      const permissionsToInsert = departments.map(department => ({
        role,
        department
      }));

      const { error: insertError } = await supabase
        .from('role_permissions')
        .insert(permissionsToInsert);

      if (insertError) {
        console.error('Error inserting new permissions:', insertError);
        return NextResponse.json({ error: 'Failed to save role permissions' }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Role permissions for ${role} updated successfully`,
      role,
      departments 
    });
  } catch (error) {
    console.error('Error in PATCH /api/manager/role-permissions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}