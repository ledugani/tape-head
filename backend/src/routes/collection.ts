import { Router, RequestHandler } from 'express';
import { addToCollection, getUserCollection } from '../controllers/collection';
import { auth } from '../middleware/auth';

const router = Router();

// POST /api/collection - Add a tape to user's collection
router.post('/', auth as RequestHandler, addToCollection as RequestHandler);

// GET /api/collection - Get user's collection
router.get('/', auth as RequestHandler, getUserCollection as RequestHandler);

export default router; 