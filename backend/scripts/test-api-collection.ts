import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function main() {
  try {
    // Get a test user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error("Missing test user. Please seed the database first.");
      return;
    }
    
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
    
    console.log('Created new test tape:', newTape.title);

    // Login to get auth token
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'test@example.com', // adjust if your test user has a different email
      password: 'testpassword123' // adjust if your test user has a different password
    });

    const token = loginResponse.data.token;
    console.log('Successfully logged in with test user');

    // Add tape to collection using the API
    const collectionResponse = await axios.post(
      `${API_URL}/collection`,
      {
        tapeId: newTape.id,
        condition: "Brand New",
        notes: "Created via API test"
      },
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    console.log('Tape added to collection successfully:');
    console.log(JSON.stringify(collectionResponse.data, null, 2));
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data || error.message);
    } else {
      console.error('Error:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main(); 