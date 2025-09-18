// Test just the translation API endpoint directly
async function testTranslationEndpoint() {
  try {
    console.log('Testing /api/translate endpoint directly...');
    
    const response = await fetch('https://jaynareviews-git-main-demetri-gregorakis-projects.vercel.app/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Hello, this is a test message'
      })
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response:', result);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTranslationEndpoint();