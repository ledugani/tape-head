import { Response } from 'express';
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';

// GET /tapes - Get all tapes
export const getAllTapes = async (req: any, res: Response): Promise<Response> => {
  try {
    const { search } = req.query;

    // Build the where clause for the query
    const where = search
      ? {
          // Case-insensitive partial match on title
          title: {
            contains: search,
            mode: Prisma.QueryMode.insensitive
          }
        }
      : undefined;

    const tapes = await prisma.tape.findMany({
      where,
      include: {
        publisher: true,
        boxSet: true
      },
      orderBy: {
        title: 'asc'
      }
    });

    return res.status(200).json(tapes);
  } catch (error) {
    console.error('Error fetching tapes:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
};

// GET /tapes/:id - Get a single tape by ID
export const getTapeById = async (req: any, res: Response): Promise<Response> => {
  try {
    const { id } = req.params;
    const tape = await prisma.tape.findUnique({
      where: { id: parseInt(id) },
      include: {
        publisher: true,
        boxSet: true
      }
    });

    if (!tape) {
      return res.status(404).json({ error: 'Tape not found' });
    }

    return res.status(200).json(tape);
  } catch (error) {
    console.error('Error fetching tape:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}; 