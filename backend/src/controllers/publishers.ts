import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

interface PublisherInput {
  name: string;
  description?: string;
  logoImage?: string;
}

// GET /publishers - List all publishers
export const getAllPublishers = async (_req: Request, res: Response) => {
  try {
    const publishers = await prisma.publisher.findMany({
      include: {
        tapes: true
      }
    });
    res.json(publishers);
  } catch (error) {
    console.error('Error fetching publishers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /publishers/:slug - Get publisher details by slug
export const getPublisher = async (req: Request, res: Response) => {
  try {
    const publisher = await prisma.publisher.findUnique({
      where: { slug: req.params.slug },
      include: {
        tapes: true
      }
    });

    if (!publisher) {
      res.status(404).json({ error: 'Publisher not found' });
      return;
    }

    res.json(publisher);
  } catch (error) {
    console.error('Error fetching publisher:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// POST /publishers - Create a new publisher
export const createPublisher = async (req: AuthRequest & { body: PublisherInput }, res: Response): Promise<Response> => {
  try {
    // Validate user authentication
    if (!req.user) {
      console.error('Authentication error: User object missing');
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    const { name, description, logoImage } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-');

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Publisher name is required' });
    }

    // Check if publisher with same name already exists
    const existingPublisher = await prisma.publisher.findUnique({
      where: { name }
    });

    if (existingPublisher) {
      return res.status(400).json({ error: 'A publisher with this name already exists' });
    }

    // Create new publisher
    const publisher = await prisma.publisher.create({
      data: {
        name,
        slug,
        description,
        logoImage
      }
    });

    return res.status(201).json(publisher);
  } catch (error) {
    console.error('Error creating publisher:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// PUT /publishers/:id - Update an existing publisher
export const updatePublisher = async (req: AuthRequest & { params: { id: string }, body: PublisherInput }, res: Response): Promise<Response> => {
  try {
    // Validate user authentication
    if (!req.user) {
      console.error('Authentication error: User object missing');
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    const { id } = req.params;
    const { name, description, logoImage } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Publisher name is required' });
    }

    // Check if publisher exists
    const existingPublisher = await prisma.publisher.findUnique({
      where: { id }
    });

    if (!existingPublisher) {
      return res.status(404).json({ error: 'Publisher not found' });
    }

    // Check if new name conflicts with another publisher
    if (name !== existingPublisher.name) {
      const nameConflict = await prisma.publisher.findUnique({
        where: { name }
      });

      if (nameConflict) {
        return res.status(400).json({ error: 'A publisher with this name already exists' });
      }
    }

    // Update publisher
    const updatedPublisher = await prisma.publisher.update({
      where: { id },
      data: {
        name,
        description,
        logoImage
      }
    });

    return res.status(200).json(updatedPublisher);
  } catch (error) {
    console.error('Error updating publisher:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /publishers/:id - Delete a publisher
export const deletePublisher = async (req: AuthRequest & { params: { id: string } }, res: Response): Promise<Response> => {
  try {
    // Validate user authentication
    if (!req.user) {
      console.error('Authentication error: User object missing');
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    const { id } = req.params;

    // Check if publisher exists
    const publisher = await prisma.publisher.findUnique({
      where: { id },
      include: {
        tapes: true
      }
    });

    if (!publisher) {
      return res.status(404).json({ error: 'Publisher not found' });
    }

    // Check if publisher has associated tapes
    if (publisher.tapes.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete publisher with associated tapes',
        tapesCount: publisher.tapes.length
      });
    }

    // Delete publisher
    await prisma.publisher.delete({
      where: { id }
    });

    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting publisher:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 