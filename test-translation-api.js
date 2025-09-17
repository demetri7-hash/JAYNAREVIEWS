// Test translation API endpoint
async function testTranslationAPI() {
  try {
    console.log('Testing translation API...');
    
    const response = await fetch('https://jaynareviews-git-main-demetri-gregorakis-projects.vercel.app/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: 'Clean the kitchen thoroughly'
      })
    });
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const result = await response.json();
      console.log('Translation successful:', result);
    } else {
      const error = await response.text();
      console.log('Translation failed:', error);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testTranslationAPI();