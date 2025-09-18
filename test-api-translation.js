// Test the actual manager updates API to see if translation is working
const fetch = require('node-fetch');

async function testManagerUpdateTranslation() {
  try {
    console.log('Testing manager update translation through API...');
    
    // First, create a test update in English
    console.log('\n=== Creating English Update ===');
    const englishUpdateData = {
      title: 'New safety procedures are in effect',
      message: 'All staff must follow the updated safety protocols in the kitchen area. Please review the new guidelines posted near the prep station.',
      priority: 'medium',
      type: 'announcement',
      requiresAcknowledgment: false
    };
    
    const createResponse = await fetch('https://jaynareviews-git-main-demetri-gregorakis-projects.vercel.app/api/manager/updates', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Note: In a real test, we'd need proper authentication
      },
      body: JSON.stringify(englishUpdateData)
    });
    
    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('Failed to create update:', createResponse.status, errorText);
      return;
    }
    
    const createResult = await createResponse.json();
    console.log('✅ Update created successfully');
    console.log('Update ID:', createResult.update?.id);
    
    // Now fetch the updates to see if translations were saved
    console.log('\n=== Fetching Updates to Check Translations ===');
    const fetchResponse = await fetch('https://jaynareviews-git-main-demetri-gregorakis-projects.vercel.app/api/manager/updates');
    
    if (!fetchResponse.ok) {
      console.error('Failed to fetch updates:', fetchResponse.status);
      return;
    }
    
    const fetchResult = await fetchResponse.json();
    console.log(`Found ${fetchResult.updates?.length || 0} updates`);
    
    // Look for our test update
    const testUpdate = fetchResult.updates?.find(u => 
      u.title.includes('safety procedures') || 
      u.title === englishUpdateData.title
    );
    
    if (testUpdate) {
      console.log('\n📋 Test Update Found:');
      console.log('ID:', testUpdate.id);
      console.log('Original title:', testUpdate.title);
      console.log('Title EN:', testUpdate.title_en);
      console.log('Title ES:', testUpdate.title_es);
      console.log('Title TR:', testUpdate.title_tr);
      console.log('');
      console.log('Original message:', testUpdate.message?.substring(0, 50) + '...');
      console.log('Message EN:', testUpdate.message_en?.substring(0, 50) + '...' || 'NULL');
      console.log('Message ES:', testUpdate.message_es?.substring(0, 50) + '...' || 'NULL');
      console.log('Message TR:', testUpdate.message_tr?.substring(0, 50) + '...' || 'NULL');
      
      // Check if translations are different from original
      const hasRealTranslations = (
        testUpdate.title_es !== testUpdate.title ||
        testUpdate.title_tr !== testUpdate.title ||
        testUpdate.message_es !== testUpdate.message ||
        testUpdate.message_tr !== testUpdate.message
      );
      
      if (hasRealTranslations) {
        console.log('\n✅ SUCCESS: Real translations detected!');
      } else {
        console.log('\n❌ ISSUE: All translations are identical to original text');
        console.log('This suggests OpenAI translation is failing and falling back to original text');
      }
    } else {
      console.log('\n❌ Test update not found in results');
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testManagerUpdateTranslation();