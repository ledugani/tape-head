import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set test environment variables
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_secret';
process.env.NODE_ENV = 'test'; 