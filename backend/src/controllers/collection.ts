import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { CollectionInput } from '../types';

export const addToCollection = async (req: Request<{}, {}, CollectionInput>, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { tapeId, condition, notes } = req.body;

    // Validate that tapeId is provided
    if (!tapeId) {
      return res.status(400).json({ error: 'Tape ID is required' });
    }

    // Check if the tape exists
    const tape = await prisma.tape.findUnique({
      where: { id: tapeId }
    });

    if (!tape) {
      return res.status(404).json({ error: 'Tape not found' });
    }

    // Check if the tape is already in the user's collection
    const existingEntry = await prisma.userCollection.findFirst({
      where: {
        userId,
        tapeId
      }
    });

    if (existingEntry) {
      return res.status(400).json({ error: 'This tape is already in your collection' });
    }

    // Create new collection entry
    const collectionEntry = await prisma.userCollection.create({
      data: {
        userId,
        tapeId,
        condition,
        notes,
      },
      include: {
        tape: true,
        user: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    res.status(201).json(collectionEntry);
  } catch (error) {
    console.error('Error adding tape to collection:', error);
    res.status(500).json({ error: 'Error adding tape to collection' });
  }
};

export const getUserCollection = async (req: Request, res: Response) => {
  try {
    // Validate that user ID exists from auth middleware
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - User ID not found' });
    }
    
    const userCollection = await prisma.userCollection.findMany({
      where: {
        userId
      },
      include: {
        tape: true
      }
    });
    
    // Return the collection (empty array if no entries found)
    res.status(200).json(userCollection);
  } catch (error) {
    console.error('Error retrieving user collection:', error);
    res.status(500).json({ error: 'Internal server error while retrieving collection' });
  }
}; 