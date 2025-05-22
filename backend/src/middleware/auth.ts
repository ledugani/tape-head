import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Extend Express Request type to include user property
export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Check for Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      console.error('Authentication error: Missing Authorization header');
      return res.status(401).json({ error: 'Authentication required - No token provided' });
    }

    // Extract token from Bearer format
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      console.error('Authentication error: Invalid token format');
      return res.status(401).json({ error: 'Authentication required - Invalid token format' });
    }

    // Verify JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error('Server configuration error: JWT_SECRET is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    try {
      // Verify and decode the token
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id: number };
      
      // Verify decoded payload has required fields
      if (!decoded || typeof decoded.id !== 'number') {
        console.error('Authentication error: Invalid token payload');
        return res.status(401).json({ error: 'Authentication required - Invalid token' });
      }

      // Find user in database
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true }
      });

      if (!user) {
        console.error(`Authentication error: User not found for ID ${decoded.id}`);
        return res.status(401).json({ error: 'Authentication required - User not found' });
      }

      // Attach user to request object
      req.user = user;
      next();
    } catch (jwtError) {
      console.error('JWT verification error:', jwtError);
      return res.status(401).json({ error: 'Authentication required - Invalid token' });
    }
  } catch (error) {
    // Log unexpected errors
    console.error('Unexpected error in auth middleware:', error);
    if (error instanceof Error) {
      console.error(error.stack);
    }
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
}; 