import { Request, Response } from 'express';
import prisma from '../lib/prisma';

interface WantlistInput {
  tapeId: number;
  priority?: number;
  notes?: string;
}

export const addToWantlist = async (req: Request<{}, {}, WantlistInput>, res: Response) => {
  try {
    const userId = (req as any).user.id;
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
    res.status(500).json({ error: 'Error adding tape to wantlist' });
  }
}; 