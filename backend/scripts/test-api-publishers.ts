import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

const prisma = new PrismaClient();
const API_URL = 'http://localhost:3000/api';

// Test data
const testUser = {
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser'
};

const testPublisher = {
  name: 'Test Publisher',
  description: 'A test publisher',
  logoImage: 'https://example.com/logo.png'
};

let authToken: string;
let testPublisherId: string;

// Helper functions
const setupTestUser = async () => {
  // Create test user
  const user = await prisma.user.create({
    data: {
      email: testUser.email,
      username: testUser.username,
      passwordHash: 'hashed_password' // In real tests, use bcrypt
    }
  });

  // Generate JWT token
  authToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'test_secret');
};

const cleanupTestData = async () => {
  // Delete test publisher
  if (testPublisherId) {
    await prisma.publisher.delete({
      where: { id: testPublisherId }
    });
  }

  // Delete test user
  await prisma.user.deleteMany({
    where: { email: testUser.email }
  });
};

// Test suite
describe('Publisher API Endpoints', () => {
  beforeAll(async () => {
    await setupTestUser();
  });

  afterAll(async () => {
    await cleanupTestData();
    await prisma.$disconnect();
  });

  // Test creating a publisher
  describe('POST /api/publishers', () => {
    it('should create a new publisher when authenticated', async () => {
      const response = await axios.post(`${API_URL}/publishers`, testPublisher, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
      expect(response.data.name).toBe(testPublisher.name);
      expect(response.data.description).toBe(testPublisher.description);
      expect(response.data.logoImage).toBe(testPublisher.logoImage);

      // Save publisher ID for later tests
      testPublisherId = response.data.id;
    });

    it('should return 401 when not authenticated', async () => {
      try {
        await axios.post(`${API_URL}/publishers`, testPublisher);
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should return 400 when name is missing', async () => {
      try {
        await axios.post(`${API_URL}/publishers`, 
          { description: 'Missing name' },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });

    it('should return 400 when publisher name already exists', async () => {
      try {
        await axios.post(`${API_URL}/publishers`, testPublisher, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  // Test getting all publishers
  describe('GET /api/publishers', () => {
    it('should return all publishers', async () => {
      const response = await axios.get(`${API_URL}/publishers`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
      expect(response.data[0]).toHaveProperty('id');
      expect(response.data[0]).toHaveProperty('name');
    });
  });

  // Test getting a single publisher
  describe('GET /api/publishers/:id', () => {
    it('should return publisher with tapes when found', async () => {
      const response = await axios.get(`${API_URL}/publishers/${testPublisherId}`);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testPublisherId);
      expect(response.data).toHaveProperty('name', testPublisher.name);
      expect(response.data).toHaveProperty('tapes');
      expect(Array.isArray(response.data.tapes)).toBe(true);
    });

    it('should return 404 when publisher not found', async () => {
      try {
        await axios.get(`${API_URL}/publishers/nonexistent-id`);
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  // Test updating a publisher
  describe('PUT /api/publishers/:id', () => {
    const updatedPublisher = {
      name: 'Updated Publisher',
      description: 'Updated description',
      logoImage: 'https://example.com/updated-logo.png'
    };

    it('should update publisher when authenticated', async () => {
      const response = await axios.put(
        `${API_URL}/publishers/${testPublisherId}`,
        updatedPublisher,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('id', testPublisherId);
      expect(response.data.name).toBe(updatedPublisher.name);
      expect(response.data.description).toBe(updatedPublisher.description);
      expect(response.data.logoImage).toBe(updatedPublisher.logoImage);
    });

    it('should return 401 when not authenticated', async () => {
      try {
        await axios.put(`${API_URL}/publishers/${testPublisherId}`, updatedPublisher);
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should return 404 when publisher not found', async () => {
      try {
        await axios.put(
          `${API_URL}/publishers/nonexistent-id`,
          updatedPublisher,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 400 when name is missing', async () => {
      try {
        await axios.put(
          `${API_URL}/publishers/${testPublisherId}`,
          { description: 'Missing name' },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  // Test deleting a publisher
  describe('DELETE /api/publishers/:id', () => {
    it('should delete publisher when authenticated', async () => {
      const response = await axios.delete(`${API_URL}/publishers/${testPublisherId}`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      expect(response.status).toBe(204);
    });

    it('should return 401 when not authenticated', async () => {
      try {
        await axios.delete(`${API_URL}/publishers/${testPublisherId}`);
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(401);
      }
    });

    it('should return 404 when publisher not found', async () => {
      try {
        await axios.delete(`${API_URL}/publishers/nonexistent-id`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });

    it('should return 400 when publisher has associated tapes', async () => {
      // Create a publisher with associated tapes
      const publisherWithTapes = await prisma.publisher.create({
        data: {
          name: 'Publisher with Tapes',
          tapes: {
            create: {
              title: 'Test Tape',
              year: 2024
            }
          }
        }
      });

      try {
        await axios.delete(`${API_URL}/publishers/${publisherWithTapes.id}`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        throw new Error('Expected request to fail');
      } catch (error: any) {
        expect(error.response.status).toBe(400);
        expect(error.response.data).toHaveProperty('tapesCount');
      }

      // Cleanup
      await prisma.publisher.delete({
        where: { id: publisherWithTapes.id }
      });
    });
  });
}); 