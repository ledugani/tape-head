import { Router, RequestHandler } from 'express';
import { addToCollection } from '../controllers/collection';
import { auth } from '../middleware/auth';

const router = Router();

// POST /api/collection - Add a tape to user's collection
router.post('/', auth as RequestHandler, addToCollection as RequestHandler);

export default router; 