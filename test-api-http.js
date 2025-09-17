// Test manager updates API via HTTP
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing manager updates API endpoint...');
    
    const response = await fetch('https://jaynareviews-git-main-demetri-gregorakis-projects.vercel.app/api/manager/updates');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers));
    
    if (response.status === 401) {
      console.log('Expected 401 - authentication required (this is correct for an unauthenticated request)');
      const text = await response.text();
      console.log('Response body:', text);
    } else if (response.status === 500) {
      console.log('Still getting 500 error - there may be another issue');
      const text = await response.text();
      console.log('Error response:', text);
    } else {
      console.log('Unexpected status - checking response');
      const text = await response.text();
      console.log('Response body:', text);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAPI();