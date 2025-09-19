// Create a test manager update
const { createClient } = require('@supabase/supabase-js');

// Production Supabase credentials
const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTestUpdate() {
  try {
    console.log('Getting manager profile...');
    
    // Get a manager profile to use as created_by
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, role, email')
      .in('role', ['manager', 'kitchen_manager', 'ordering_manager'])
      .limit(1);
    
    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return;
    }
    
    if (!profiles || profiles.length === 0) {
      console.log('No manager profiles found. Creating with placeholder...');
      // Use a UUID for testing
      const testManagerId = '00000000-0000-0000-0000-000000000000';
      
      console.log('Creating test manager update...');
      const { data: updateData, error: updateError } = await supabase
        .from('manager_updates')
        .insert({
          title: 'Welcome to Manager Dashboard',
          message: 'This is a test manager update to verify the dashboard is working correctly.',
          title_en: 'Welcome to Manager Dashboard',
          title_es: 'Bienvenido al Panel de Manager',
          title_tr: 'Yönetici Paneline Hoş Geldiniz',
          message_en: 'This is a test manager update to verify the dashboard is working correctly.',
          message_es: 'Esta es una actualización de prueba del gerente para verificar que el panel funciona correctamente.',
          message_tr: 'Bu, gösterge tablosunun doğru çalıştığını doğrulamak için bir test yönetici güncellemesidir.',
          priority: 'medium',
          type: 'announcement',
          requires_acknowledgment: false,
          created_by: testManagerId,
          is_active: true
        })
        .select()
        .single();
      
      if (updateError) {
        console.error('Error creating test update:', updateError);
      } else {
        console.log('✅ Test manager update created:', updateData);
      }
    } else {
      const manager = profiles[0];
      console.log('Using manager:', manager.email);
      
      console.log('Creating test manager update...');
      const { data: updateData, error: updateError } = await supabase
        .from('manager_updates')
        .insert({
          title: 'Welcome to Manager Dashboard',
          message: 'This is a test manager update to verify the dashboard is working correctly.',
          title_en: 'Welcome to Manager Dashboard',
          title_es: 'Bienvenido al Panel de Manager',
          title_tr: 'Yönetici Paneline Hoş Geldiniz',
          message_en: 'This is a test manager update to verify the dashboard is working correctly.',
          message_es: 'Esta es una actualización de prueba del gerente para verificar que el panel funciona correctamente.',
          message_tr: 'Bu, gösterge tablosunun doğru çalıştığını doğrulamak için bir test yönetici güncellemesidir.',
          priority: 'medium',
          type: 'announcement',
          requires_acknowledgment: false,
          created_by: manager.id,
          is_active: true
        })
        .select()
        .single();
      
      if (updateError) {
        console.error('Error creating test update:', updateError);
      } else {
        console.log('✅ Test manager update created:', updateData);
      }
    }
    
  } catch (error) {
    console.error('Error creating test update:', error);
  }
}

createTestUpdate().catch(console.error);