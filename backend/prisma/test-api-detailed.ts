import fetch from 'node-fetch';

async function testApiDetailed() {
  // First, login to get token
  console.log('\n=== Login Request ===');
  const loginUrl = 'http://localhost:3000/api/auth/login';
  const loginBody = {
    email: 'iamtest@test.com',
    password: 'password1'
  };
  console.log('URL:', loginUrl);
  console.log('Body:', JSON.stringify(loginBody, null, 2));

  const loginResponse = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(loginBody)
  });

  console.log('\n=== Login Response ===');
  console.log('Status:', loginResponse.status);
  const loginData = await loginResponse.json();
  console.log('Body:', JSON.stringify(loginData, null, 2));

  if (!loginData.accessToken) {
    console.error('Failed to get token');
    return;
  }

  const token = loginData.accessToken;
  console.log('\nToken:', token);

  // Test collection endpoint
  console.log('\n=== Collection Request ===');
  const collectionUrl = 'http://localhost:3000/api/collection';
  console.log('URL:', collectionUrl);
  console.log('Headers:', {
    'Authorization': `Bearer ${token}`
  });

  const collectionResponse = await fetch(collectionUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('\n=== Collection Response ===');
  console.log('Status:', collectionResponse.status);
  const collectionData = await collectionResponse.json();
  console.log('Body:', JSON.stringify(collectionData, null, 2));

  // Test wantlist endpoint
  console.log('\n=== Wantlist Request ===');
  const wantlistUrl = 'http://localhost:3000/api/wantlist';
  console.log('URL:', wantlistUrl);
  console.log('Headers:', {
    'Authorization': `Bearer ${token}`
  });

  const wantlistResponse = await fetch(wantlistUrl, {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log('\n=== Wantlist Response ===');
  console.log('Status:', wantlistResponse.status);
  const wantlistData = await wantlistResponse.json();
  console.log('Body:', JSON.stringify(wantlistData, null, 2));
}

testApiDetailed().catch(console.error); 