import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { RegisterInput, LoginInput } from '../types';
import prisma from '../lib/prisma';

const ACCESS_TOKEN_EXPIRY = '1h';
const REFRESH_TOKEN_EXPIRY = '7d';

export const register = async (req: Request<{}, {}, RegisterInput>, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Username, email, and password are required.' 
      });
    }

    // Validate username format
    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ 
        error: 'Username must be between 3 and 30 characters.' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === email) {
        return res.status(400).json({ 
          error: 'An account with this email already exists. Please try logging in instead.' 
        });
      }
      if (existingUser.username === username) {
        return res.status(400).json({ 
          error: 'This username is already taken. Please choose a different username.' 
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash
      }
    });

    // Generate tokens
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY });

    // Return user (excluding password) and tokens
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.status(201).json({ 
      success: true,
      user: userWithoutPassword, 
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Something went wrong while creating your account. Please try again in a few moments.' 
    });
  }
};

export const login = async (req: Request<{}, {}, LoginInput>, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        error: 'No account found with this email. Please check your email or sign up for a new account.' 
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Incorrect password. Please try again or use the "Forgot Password" link if you need to reset it.' 
      });
    }

    // Generate tokens
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY });

    // Return user (excluding password) and tokens
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ 
      user: userWithoutPassword, 
      accessToken,
      refreshToken,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      error: 'Something went wrong while trying to log you in. Please try again in a few moments.' 
    });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { id: number };

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Generate new tokens
    const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET!, { expiresIn: ACCESS_TOKEN_EXPIRY });
    const newRefreshToken = jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET!, { expiresIn: REFRESH_TOKEN_EXPIRY });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: 3600 // 1 hour in seconds
    });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: (req as any).user.id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching user' });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    // The auth middleware has already verified the token and attached the user
    const user = (req as any).user;
    
    if (!user) {
      return res.status(401).json({ 
        error: 'Not authenticated. Please log in.' 
      });
    }

    // Return the user data
    const { passwordHash: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Error verifying authentication status' 
    });
  }
}; 