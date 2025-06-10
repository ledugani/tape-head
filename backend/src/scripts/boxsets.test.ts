import request from 'supertest';
import { app } from '../index';
import prisma from '../lib/prisma';

describe('Box Set API', () => {
  beforeAll(async () => {
    // Create a test box set
    await prisma.boxSet.create({
      data: {
        title: 'Test Box Set',
        year: 1995,
        label: 'Test Label',
        description: 'Test Description',
        tapes: {
          create: [
            {
              title: 'Test Tape 1',
              year: 1995,
              genre: 'Test',
              format: 'VHS'
            },
            {
              title: 'Test Tape 2',
              year: 1995,
              genre: 'Test',
              format: 'VHS'
            }
          ]
        }
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.tape.deleteMany({
      where: {
        title: {
          in: ['Test Tape 1', 'Test Tape 2']
        }
      }
    });
    await prisma.boxSet.deleteMany({
      where: {
        title: 'Test Box Set'
      }
    });
    await prisma.$disconnect();
  });

  describe('GET /api/boxsets/:id', () => {
    it('should return 404 for non-existent box set', async () => {
      const response = await request(app)
        .get('/api/boxsets/999')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Box set not found');
    });

    it('should return box set details for existing box set', async () => {
      // First, get the ID of our test box set
      const boxSet = await prisma.boxSet.findFirst({
        where: { title: 'Test Box Set' }
      });

      if (!boxSet) {
        throw new Error('Test box set not found');
      }

      const response = await request(app)
        .get(`/api/boxsets/${boxSet.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', boxSet.id);
      expect(response.body).toHaveProperty('title', 'Test Box Set');
      expect(response.body).toHaveProperty('year', 1995);
      expect(response.body).toHaveProperty('label', 'Test Label');
      expect(response.body).toHaveProperty('description', 'Test Description');
      expect(response.body).toHaveProperty('tapes');
      expect(Array.isArray(response.body.tapes)).toBe(true);
      expect(response.body.tapes).toHaveLength(2);
    });
  });
}); 