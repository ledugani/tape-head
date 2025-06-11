import { Request, Response } from 'express';
import prisma from '../lib/prisma';

// GET /boxsets/:id - Get box set details by ID
export const getBoxSet = async (req: Request, res: Response) => {
  try {
    const boxSet = await prisma.boxSet.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        tapes: true
      }
    });

    if (!boxSet) {
      res.status(404).json({ error: 'Box set not found' });
      return;
    }

    res.json(boxSet);
  } catch (error) {
    console.error('Error fetching box set:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 