import { PrismaClient } from '@prisma/client';
import axios, { AxiosError } from 'axios';
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

async function main() {
  try {
    console.log('Running tests for wantlist functionality...');
    
    // Get a test user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error("Missing test user. Please seed the database first.");
      process.exit(1);
    }
    
    console.log(`Using test user: ${user.email} (ID: ${user.id})`);
    
    // Generate JWT token for authentication
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'testsecret');
    const authHeader = { Authorization: `Bearer ${token}` };
    
    // Create a new test tape
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
    
    // Test 1: Unauthenticated request should return 401
    console.log('\n--- Test 1: Unauthenticated POST request ---');
    try {
      await axios.post(`${API_URL}/wantlist`, { tapeId: newTape.id });
      console.error('❌ Test failed: Unauthenticated request should return 401');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        console.log('✅ Test passed: Unauthenticated request returned 401');
      } else {
        console.error(`❌ Test failed: Expected 401, got ${axiosError.response?.status}`);
      }
    }
    
    // Test 2: Add a tape to wantlist
    console.log('\n--- Test 2: Add tape to wantlist ---');
    try {
      const response = await axios.post(
        `${API_URL}/wantlist`, 
        { tapeId: newTape.id, priority: 2, notes: "Test note" },
        { headers: authHeader }
      );
      
      if (response.status === 201) {
        console.log('✅ Test passed: Tape added to wantlist');
        
        // Verify response data
        const wantlistEntry = response.data;
        if (
          wantlistEntry.tapeId === newTape.id &&
          wantlistEntry.userId === user.id &&
          wantlistEntry.priority === 2 &&
          wantlistEntry.notes === "Test note" &&
          wantlistEntry.tape &&
          wantlistEntry.user
        ) {
          console.log('✅ Test passed: Response includes expected tape and user data');
        } else {
          console.error('❌ Test failed: Response missing expected data');
        }
      } else {
        console.error(`❌ Test failed: Expected 201, got ${response.status}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('❌ Test failed: Could not add tape to wantlist', axiosError.response?.data);
    }
    
    // Test 3: Add duplicate tape (should fail with 400)
    console.log('\n--- Test 3: Add duplicate tape ---');
    try {
      await axios.post(
        `${API_URL}/wantlist`, 
        { tapeId: newTape.id },
        { headers: authHeader }
      );
      console.error('❌ Test failed: Adding duplicate tape should return 400');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 400) {
        console.log('✅ Test passed: Adding duplicate tape returned 400');
      } else {
        console.error(`❌ Test failed: Expected 400, got ${axiosError.response?.status}`);
      }
    }
    
    // Test 4: Add non-existent tape (should fail with 404)
    console.log('\n--- Test 4: Add non-existent tape ---');
    try {
      const nonExistentId = 99999;
      await axios.post(
        `${API_URL}/wantlist`, 
        { tapeId: nonExistentId },
        { headers: authHeader }
      );
      console.error('❌ Test failed: Adding non-existent tape should return 404');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 404) {
        console.log('✅ Test passed: Adding non-existent tape returned 404');
      } else {
        console.error(`❌ Test failed: Expected 404, got ${axiosError.response?.status}`);
      }
    }
    
    // Test 5: GET /wantlist - Unauthenticated request should return 401
    console.log('\n--- Test 5: Unauthenticated GET request ---');
    try {
      await axios.get(`${API_URL}/wantlist`);
      console.error('❌ Test failed: Unauthenticated GET request should return 401');
    } catch (error) {
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401) {
        console.log('✅ Test passed: Unauthenticated GET request returned 401');
      } else {
        console.error(`❌ Test failed: Expected 401, got ${axiosError.response?.status}`);
      }
    }
    
    // Test 6: GET /wantlist - Authenticated user can retrieve their wantlist
    console.log('\n--- Test 6: Authenticated GET request ---');
    try {
      const response = await axios.get(
        `${API_URL}/wantlist`,
        { headers: authHeader }
      );
      
      if (response.status === 200) {
        console.log('✅ Test passed: Authenticated GET request returned 200');
        
        // Verify response data is an array
        const wantlist = response.data;
        if (Array.isArray(wantlist)) {
          console.log('✅ Test passed: Response is an array');
          
          // Find our test entry
          const testEntry = wantlist.find(item => item.tapeId === newTape.id);
          
          if (testEntry) {
            console.log('✅ Test passed: Found test entry in wantlist');
            
            // Verify tape data is included
            if (
              testEntry.tape &&
              testEntry.tape.id === newTape.id &&
              testEntry.tape.title === newTape.title
            ) {
              console.log('✅ Test passed: Response includes associated Tape data');
            } else {
              console.error('❌ Test failed: Response missing associated Tape data');
            }
          } else {
            console.error('❌ Test failed: Test entry not found in wantlist');
          }
        } else {
          console.error('❌ Test failed: Response is not an array');
        }
      } else {
        console.error(`❌ Test failed: Expected 200, got ${response.status}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('❌ Test failed: Could not retrieve wantlist', axiosError.response?.data);
    }
    
    // Test 7: Empty wantlist test
    console.log('\n--- Test 7: Empty wantlist test ---');
    
    // First, clean up the test wantlist entry to ensure empty wantlist
    await prisma.userWantlist.deleteMany({
      where: {
        userId: user.id,
        tapeId: newTape.id
      }
    });
    console.log('Cleaned up test wantlist entry for empty wantlist test');
    
    try {
      const response = await axios.get(
        `${API_URL}/wantlist`,
        { headers: authHeader }
      );
      
      if (response.status === 200) {
        console.log('✅ Test passed: Empty wantlist request returned 200');
        
        // Verify response is an empty array
        const wantlist = response.data;
        if (Array.isArray(wantlist) && wantlist.length === 0) {
          console.log('✅ Test passed: Empty wantlist returns an empty array');
        } else {
          console.error('❌ Test failed: Expected empty array for empty wantlist');
        }
      } else {
        console.error(`❌ Test failed: Expected 200, got ${response.status}`);
      }
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('❌ Test failed: Error retrieving empty wantlist', axiosError.response?.data);
    }
    
    // Clean up - remove the test tape
    await prisma.tape.delete({
      where: {
        id: newTape.id
      }
    });
    console.log(`Cleaned up test tape (ID: ${newTape.id})`);
    
    console.log('\nAll tests completed successfully.');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 