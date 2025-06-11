import { Response } from 'express';
import prisma from '../lib/prisma';
import { CollectionInput } from '../types';
import { AuthRequest } from '../middleware/auth';

export const addToCollection = async (req: AuthRequest & { body: CollectionInput }, res: Response): Promise<Response> => {
  try {
    // Validate user authentication
    if (!req.user) {
      console.error('Authentication error: User object missing');
      return res.status(401).json({ error: 'Unauthorized - Authentication required' });
    }

    // Extract userId from req.user.id
    const userId = req.user.id;
    if (!userId) {
      console.error('Authentication error: User ID missing');
      return res.status(401).json({ error: 'Unauthorized - User ID not found' });
    }

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
    try {
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

      return res.status(201).json(collectionEntry);
    } catch (dbError) {
      console.error('Database error when adding to collection:', dbError);
      return res.status(500).json({ error: 'Internal server error - Database operation failed' });
    }
  } catch (error) {
    // Log the unexpected error with stack trace if available
    console.error('Unexpected error in addToCollection:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

export const getUserCollection = async (req: AuthRequest, res: Response): Promise<Response> => {
  console.debug('[Collection] Received collection request:', {
    userId: req.user?.id,
    headers: req.headers,
    cookies: req.cookies
  });

  try {
    // Validate user authentication
    if (!req.user) {
      console.error('[Collection] Authentication error: User object missing');
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized - Authentication required' 
      });
    }

    // Extract userId from req.user.id
    const userId = req.user.id;
    if (!userId) {
      console.error('[Collection] Authentication error: User ID missing');
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized - User ID not found' 
      });
    }
    
    try {
      console.debug('[Collection] Fetching collection for user:', userId);
      const userCollection = await prisma.userCollection.findMany({
        where: {
          userId
        },
        include: {
          tape: true
        }
      });
      
      console.debug('[Collection] Found items:', userCollection.length);
      // Return the collection with success flag
      return res.status(200).json({
        success: true,
        data: userCollection
      });
    } catch (dbError) {
      console.error('[Collection] Database error:', dbError);
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error - Database operation failed' 
      });
    }
  } catch (error) {
    console.error('[Collection] Unexpected error:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
}; 