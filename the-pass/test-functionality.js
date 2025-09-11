// Simple test script to verify core functionality
// Run this in browser console at localhost:3000

async function testUserCreationAndMessaging() {
    console.log('🧪 Testing The Pass Core Functionality');
    
    // Test 1: User Creation
    console.log('\n1️⃣ Testing user creation...');
    try {
        const response = await fetch('/api/test-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@jaynagyro.com',
                department: 'FOH',
                role: 'employee'
            })
        });
        
        if (response.ok) {
            const user = await response.json();
            console.log('✅ User created:', user);
        } else {
            console.log('❌ User creation failed:', await response.text());
        }
    } catch (error) {
        console.log('❌ User creation error:', error);
    }
    
    // Test 2: Channel Creation
    console.log('\n2️⃣ Testing channel creation...');
    // This would test channel creation
    
    // Test 3: Message Creation
    console.log('\n3️⃣ Testing message creation...');
    // This would test message creation
}

// Call the test function
testUserCreationAndMessaging();
