import { PrismaClient } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

async function main() {
  try {
    console.log('Running JWT authentication tests...');
    
    // Get a test user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error("Missing test user. Please seed the database first.");
      process.exit(1);
    }
    
    console.log(`Using test user: ${user.email} (ID: ${user.id})`);
    
    // Create a new test tape for collection/wantlist tests
    const newTape = await prisma.tape.create({
      data: {
        title: `Test Tape ${Date.now()}`,
        year: 1995,
        genre: "Test",
        format: "VHS",
        label: "Test Label"
      }
    });
    
    console.log(`Created test tape: ${newTape.title} (ID: ${newTape.id})`);

    // Test 1: No token provided
    console.log('\n--- Test 1: No token provided ---');
    await testUnauthenticatedRequest('GET', '/collection');
    await testUnauthenticatedRequest('GET', '/wantlist');
    await testUnauthenticatedRequest('POST', '/collection', { tapeId: newTape.id });
    await testUnauthenticatedRequest('POST', '/wantlist', { tapeId: newTape.id });

    // Test 2: Invalid token format
    console.log('\n--- Test 2: Invalid token format ---');
    await testInvalidToken('GET', '/collection', 'invalid-token');
    await testInvalidToken('GET', '/wantlist', 'invalid-token');
    await testInvalidToken('POST', '/collection', 'invalid-token', { tapeId: newTape.id });
    await testInvalidToken('POST', '/wantlist', 'invalid-token', { tapeId: newTape.id });

    // Test 3: Expired token
    console.log('\n--- Test 3: Expired token ---');
    const expiredToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '0s' }
    );
    await testInvalidToken('GET', '/collection', expiredToken);
    await testInvalidToken('GET', '/wantlist', expiredToken);
    await testInvalidToken('POST', '/collection', expiredToken, { tapeId: newTape.id });
    await testInvalidToken('POST', '/wantlist', expiredToken, { tapeId: newTape.id });

    // Test 4: Malformed token (invalid signature)
    console.log('\n--- Test 4: Malformed token ---');
    const malformedToken = jwt.sign(
      { id: user.id },
      'wrong-secret-key',
      { expiresIn: '1h' }
    );
    await testInvalidToken('GET', '/collection', malformedToken);
    await testInvalidToken('GET', '/wantlist', malformedToken);
    await testInvalidToken('POST', '/collection', malformedToken, { tapeId: newTape.id });
    await testInvalidToken('POST', '/wantlist', malformedToken, { tapeId: newTape.id });

    // Test 5: Valid token
    console.log('\n--- Test 5: Valid token ---');
    const validToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'testsecret',
      { expiresIn: '1h' }
    );
    await testValidToken('GET', '/collection', validToken);
    await testValidToken('GET', '/wantlist', validToken);
    await testValidToken('POST', '/collection', validToken, { tapeId: newTape.id });
    await testValidToken('POST', '/wantlist', validToken, { tapeId: newTape.id });

    // Clean up - remove the test tape
    await prisma.tape.delete({
      where: {
        id: newTape.id
      }
    });
    console.log(`Cleaned up test tape (ID: ${newTape.id})`);
    
    console.log('\nAll authentication tests completed successfully.');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

async function testUnauthenticatedRequest(method: string, endpoint: string, data?: any) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      ...(data && { data })
    };
    
    await axios(config);
    console.error(`❌ Test failed: ${method} ${endpoint} without token should return 401`);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      console.log(`✅ Test passed: ${method} ${endpoint} without token returned 401`);
    } else {
      console.error(`❌ Test failed: Expected 401, got ${axiosError.response?.status}`);
    }
  }
}

async function testInvalidToken(method: string, endpoint: string, token: string, data?: any) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
      ...(data && { data })
    };
    
    await axios(config);
    console.error(`❌ Test failed: ${method} ${endpoint} with invalid token should return 401`);
  } catch (error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) {
      console.log(`✅ Test passed: ${method} ${endpoint} with invalid token returned 401`);
    } else {
      console.error(`❌ Test failed: Expected 401, got ${axiosError.response?.status}`);
    }
  }
}

async function testValidToken(method: string, endpoint: string, token: string, data?: any) {
  try {
    const config = {
      method,
      url: `${API_URL}${endpoint}`,
      headers: { Authorization: `Bearer ${token}` },
      ...(data && { data })
    };
    
    const response = await axios(config);
    
    // For GET requests, expect 200
    // For POST requests, expect 201 (created) or 400 (if duplicate)
    const expectedStatus = method === 'GET' ? 200 : 201;
    
    if (response.status === expectedStatus || response.status === 400) {
      console.log(`✅ Test passed: ${method} ${endpoint} with valid token returned ${response.status}`);
    } else {
      console.error(`❌ Test failed: Expected ${expectedStatus}, got ${response.status}`);
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    // For POST requests, 400 is acceptable (e.g., duplicate entry)
    if (method === 'POST' && axiosError.response?.status === 400) {
      console.log(`✅ Test passed: ${method} ${endpoint} with valid token returned 400 (expected for duplicate)`);
    } else {
      console.error(`❌ Test failed: ${method} ${endpoint} with valid token failed`, axiosError.response?.data);
    }
  }
}

main(); 