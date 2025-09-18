// Test translation API locally
const fetch = require('node-fetch');

async function testTranslationAPI() {
  try {
    console.log('Testing translation API at http://localhost:3000...');
    
    const response = await fetch('http://localhost:3000/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, this is a test message for translation'
      })
    });
    
    if (!response.ok) {
      console.error('API response not OK:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const result = await response.json();
    console.log('Translation result:', result);
    
    if (result.translations) {
      console.log('\n✅ Translation successful!');
      console.log('English:', result.translations.en);
      console.log('Spanish:', result.translations.es);
      console.log('Turkish:', result.translations.tr);
    } else {
      console.log('❌ Translation failed or no translations returned');
    }
    
  } catch (error) {
    console.error('Error testing translation API:', error.message);
  }
}

// Wait a bit for the server to start
setTimeout(testTranslationAPI, 5000);