import fetch from 'node-fetch';

async function testApi() {
  // First, login to get token
  const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'iamtest@test.com',
      password: 'password1'
    })
  });

  const loginData = await loginResponse.json();
  if (!loginData.accessToken) {
    console.error('Failed to get token:', loginData);
    return;
  }

  const token = loginData.accessToken;
  console.log('Got token successfully');

  // Test collection endpoint
  console.log('\n=== Testing Collection Endpoint ===');
  const collectionResponse = await fetch('http://localhost:3000/api/collection', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const collectionData = await collectionResponse.json();
  console.log('Collection response:', JSON.stringify(collectionData, null, 2));

  // Test wantlist endpoint
  console.log('\n=== Testing Wantlist Endpoint ===');
  const wantlistResponse = await fetch('http://localhost:3000/api/wantlist', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const wantlistData = await wantlistResponse.json();
  console.log('Wantlist response:', JSON.stringify(wantlistData, null, 2));
}

testApi().catch(console.error); 