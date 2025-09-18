// Test the translation system by creating a manager update
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://xedpssqxgmnwufatyoje.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlZHBzc3F4Z21ud3VmYXR5b2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzI4Mjg5NiwiZXhwIjoyMDcyODU4ODk2fQ.HUvKHpS9JMrAYE8iwN5-IQfHCe35NSvpYWNyLYVO29s';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testTranslationSystem() {
  try {
    console.log('Testing translation system by creating manager updates...');
    
    // Get a manager profile
    const { data: managers, error: managerError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('role', 'manager')
      .limit(1);
    
    if (managerError || !managers?.length) {
      console.error('No manager found:', managerError);
      return;
    }
    
    const manager = managers[0];
    console.log('Using manager:', manager.email);
    
    // Test 1: Create an update in English (should auto-translate to ES and TR)
    console.log('\n--- Test 1: English Update ---');
    const englishUpdate = {
      title: 'New Menu Items Available',
      message: 'We have added three new delicious items to our menu. Please familiarize yourself with the ingredients and preparation methods.',
      priority: 'medium',
      type: 'announcement',
      requires_acknowledgment: false,
      created_by: manager.id
    };
    
    const { data: englishResult, error: englishError } = await supabase
      .from('manager_updates')
      .insert([englishUpdate])
      .select('id, title, title_en, title_es, title_tr, message, message_en, message_es, message_tr')
      .single();
    
    if (englishError) {
      console.error('Error creating English update:', englishError);
    } else {
      console.log('✅ English update created:', {
        title: englishResult.title,
        title_en: englishResult.title_en,
        title_es: englishResult.title_es,
        title_tr: englishResult.title_tr
      });
    }
    
    // Test 2: Create an update in Spanish (should auto-translate to EN and TR)
    console.log('\n--- Test 2: Spanish Update ---');
    const spanishUpdate = {
      title: 'Nuevos horarios de limpieza',
      message: 'Hemos actualizado los horarios de limpieza para mejorar la eficiencia. Por favor revisen el nuevo calendario en la cocina.',
      priority: 'medium', 
      type: 'announcement',
      requires_acknowledgment: false,
      created_by: manager.id
    };
    
    const { data: spanishResult, error: spanishError } = await supabase
      .from('manager_updates')
      .insert([spanishUpdate])
      .select('id, title, title_en, title_es, title_tr, message, message_en, message_es, message_tr')
      .single();
    
    if (spanishError) {
      console.error('Error creating Spanish update:', spanishError);
    } else {
      console.log('✅ Spanish update created:', {
        title: spanishResult.title,
        title_en: spanishResult.title_en,
        title_es: spanishResult.title_es,
        title_tr: spanishResult.title_tr
      });
    }
    
    // Test 3: Create an update in Turkish (should auto-translate to EN and ES)
    console.log('\n--- Test 3: Turkish Update ---');
    const turkishUpdate = {
      title: 'Yeni güvenlik protokolleri',
      message: 'Mutfak güvenliği için yeni protokoller uygulanmıştır. Lütfen tüm güvenlik kurallarını dikkatlice okuyun ve uygulayın.',
      priority: 'high',
      type: 'alert', 
      requires_acknowledgment: false,
      created_by: manager.id
    };
    
    const { data: turkishResult, error: turkishError } = await supabase
      .from('manager_updates')
      .insert([turkishUpdate])
      .select('id, title, title_en, title_es, title_tr, message, message_en, message_es, message_tr')
      .single();
    
    if (turkishError) {
      console.error('Error creating Turkish update:', turkishError);
    } else {
      console.log('✅ Turkish update created:', {
        title: turkishResult.title,
        title_en: turkishResult.title_en,
        title_es: turkishResult.title_es,
        title_tr: turkishResult.title_tr
      });
    }
    
    console.log('\n🎉 Translation system test completed!');
    console.log('Check the team activity page to see if updates appear in different languages when you toggle the language flags.');
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testTranslationSystem();