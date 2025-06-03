import { Router } from 'express';
import { addToCollection, getUserCollection } from '../controllers/collection';
import { authenticate } from '../middleware/auth';

const router = Router();

// POST /api/collection - Add a tape to user's collection
router.post('/', authenticate as any, addToCollection as any);

// GET /api/collection - Get user's collection
router.get('/', authenticate as any, getUserCollection as any);

export default router; 