import { Response } from 'express';
import prisma from '../lib/prisma';
import { AuthRequest } from '../middleware/auth';

interface WantlistInput {
  tapeId: number;
  priority?: number;
  notes?: string;
}

// GET /wantlist - Get all wantlist entries for the authenticated user
export const getUserWantlist = async (req: AuthRequest, res: Response): Promise<Response> => {
  console.debug('[Wantlist] Received wantlist request:', {
    userId: req.user?.id,
    headers: req.headers,
    cookies: req.cookies
  });

  try {
    // Validate user authentication
    if (!req.user) {
      console.error('[Wantlist] Authentication error: User object missing');
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized - Authentication required' 
      });
    }

    // Extract userId from req.user.id
    const userId = req.user.id;
    if (!userId) {
      console.error('[Wantlist] Authentication error: User ID missing');
      return res.status(401).json({ 
        success: false,
        error: 'Unauthorized - User ID not found' 
      });
    }

    // Get user's wantlist with tape details
    try {
      console.debug('[Wantlist] Fetching wantlist for user:', userId);
      const wantlist = await prisma.userWantlist.findMany({
        where: { userId },
        include: {
          tape: true
        },
        orderBy: {
          priority: 'desc'
        }
      });

      console.debug('[Wantlist] Found items:', wantlist.length);
      // Return the result with success flag
      return res.status(200).json({
        success: true,
        data: wantlist
      });
    } catch (dbError) {
      console.error('[Wantlist] Database error:', dbError);
      return res.status(500).json({ 
        success: false,
        error: 'Internal server error - Database operation failed' 
      });
    }
  } catch (error) {
    console.error('[Wantlist] Unexpected error:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
};

// POST /wantlist - Add a tape to user's wantlist
export const addToWantlist = async (req: AuthRequest & { body: WantlistInput }, res: Response): Promise<Response> => {
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
    try {
      const wantlistEntry = await prisma.userWantlist.create({
        data: {
          userId,
          tapeId,
          priority,
          notes
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

      return res.status(201).json(wantlistEntry);
    } catch (dbError) {
      console.error('Database error when adding to wantlist:', dbError);
      return res.status(500).json({ error: 'Internal server error - Database operation failed' });
    }
  } catch (error) {
    // Log the unexpected error with stack trace if available
    console.error('Unexpected error in addToWantlist:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    // Return 500 Internal Server Error with generic message
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// DELETE /wantlist/:id - Delete a wantlist entry
export const deleteFromWantlist = async (req: AuthRequest & { params: { id: string } }, res: Response): Promise<Response> => {
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

    const { id } = req.params;

    // Check if the wantlist entry exists and belongs to the user
    const wantlistEntry = await prisma.userWantlist.findUnique({
      where: {
        id
      }
    });

    if (!wantlistEntry) {
      return res.status(404).json({ error: 'Wantlist entry not found' });
    }

    // Verify the entry belongs to the user
    if (wantlistEntry.userId !== userId) {
      return res.status(403).json({ error: 'You do not have permission to delete this wantlist entry' });
    }

    // Delete the wantlist entry
    try {
      await prisma.userWantlist.delete({
        where: {
          id
        }
      });

      return res.status(204).send();
    } catch (dbError) {
      console.error('Database error when deleting from wantlist:', dbError);
      return res.status(500).json({ error: 'Internal server error - Database operation failed' });
    }
  } catch (error) {
    // Log the unexpected error with stack trace if available
    console.error('Unexpected error in deleteFromWantlist:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    
    // Return 500 Internal Server Error with generic message
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 