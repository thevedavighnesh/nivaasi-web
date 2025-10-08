// Test signin process
async function testSignin() {
  try {
    console.log('🧪 Testing signin process\n');
    
    // First, create a test user
    const testEmail = `test${Date.now()}@example.com`;
    const testPassword = 'testpass123';
    
    console.log('1️⃣ Creating test user...');
    const signupResponse = await fetch('http://localhost:4000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: testEmail,
        phone: '+91-9876543210',
        password: testPassword,
        userType: 'tenant'
      })
    });
    
    const signupData = await signupResponse.json();
    console.log('   ✅ User created:', signupData.user?.email);
    
    // Now test signin
    console.log('\n2️⃣ Testing signin...');
    console.log('   Email:', testEmail);
    console.log('   Password:', testPassword);
    
    // Test the custom signin endpoint
    const signinResponse = await fetch('http://localhost:4000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword
      })
    });
    
    console.log('\n📥 Signin response status:', signinResponse.status);
    console.log('📥 Content-Type:', signinResponse.headers.get('content-type'));
    
    const contentType = signinResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const signinData = await signinResponse.json();
      console.log('📥 Response:', signinData);
      
      if (signinResponse.ok) {
        console.log('\n✅ SIGNIN WORKS!');
      } else {
        console.log('\n❌ Signin failed:', signinData);
      }
    } else {
      const text = await signinResponse.text();
      console.log('\n❌ Non-JSON response (first 300 chars):');
      console.log(text.substring(0, 300));
    }
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
  }
}

testSignin();
