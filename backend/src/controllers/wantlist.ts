import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface WantlistInput {
  tapeId: number;
  priority?: number;
  notes?: string;
}

// Extend the Request type to include user property
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const getUserWantlist = async (req: AuthRequest, res: Response) => {
  try {
    // Extract userId from req.user.id
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - User ID not found' });
    }

    // Get user's wantlist with tape details
    const wantlist = await prisma.userWantlist.findMany({
      where: { userId },
      include: {
        tape: true
      },
      orderBy: {
        priority: 'desc'
      }
    });

    // Return the result as JSON with status 200 (even if it's an empty array)
    res.status(200).json(wantlist);
  } catch (error) {
    console.error('Error fetching wantlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addToWantlist = async (req: AuthRequest & { body: WantlistInput }, res: Response) => {
  try {
    // Extract userId from req.user.id
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized - User ID not found' });
    }

    const { tapeId, priority = 1, notes } = req.body;

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

    // Check if the tape is already in the user's wantlist
    const existingEntry = await prisma.userWantlist.findFirst({
      where: {
        userId,
        tapeId
      }
    });

    if (existingEntry) {
      return res.status(400).json({ error: 'This tape is already in your wantlist' });
    }

    // Create new wantlist entry
    const wantlistEntry = await prisma.userWantlist.create({
      data: {
        userId,
        tapeId,
        priority,
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

    res.status(201).json(wantlistEntry);
  } catch (error) {
    console.error('Error adding tape to wantlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 