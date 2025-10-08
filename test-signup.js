// Test signup API endpoint
async function testSignup() {
  try {
    console.log('🧪 Testing signup API at http://localhost:4000/api/auth/signup\n');
    
    const testData = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      phone: '+91-9876543210',
      password: 'testpass123',
      userType: 'tenant'
    };
    
    console.log('📤 Sending request with data:', { ...testData, password: '***' });
    
    const response = await fetch('http://localhost:4000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log('\n📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const contentType = response.headers.get('content-type');
    console.log('\n🔍 Content-Type:', contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('\n✅ JSON Response:', data);
      
      if (response.ok) {
        console.log('\n🎉 SIGNUP WORKS! User created successfully!');
      } else {
        console.log('\n⚠️ API returned error:', data.error || data.details);
      }
    } else {
      const text = await response.text();
      console.log('\n❌ Non-JSON Response (first 500 chars):');
      console.log(text.substring(0, 500));
      console.log('\n🔧 This is the problem - API should return JSON but returned HTML/text');
    }
    
  } catch (error) {
    console.error('\n❌ Request failed:', error.message);
    console.log('\n🔧 Possible issues:');
    console.log('   - Server not running on port 4000');
    console.log('   - API route not properly configured');
    console.log('   - Network error');
  }
}

testSignup();
