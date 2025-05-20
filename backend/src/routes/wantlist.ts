import { Router, RequestHandler } from 'express';
import { addToWantlist, getUserWantlist } from '../controllers/wantlist';
import { auth } from '../middleware/auth';

const router = Router();

// GET /api/wantlist - Get user's wantlist
router.get('/', auth as RequestHandler, getUserWantlist as RequestHandler);

// POST /api/wantlist - Add a tape to user's wantlist
router.post('/', auth as RequestHandler, addToWantlist as RequestHandler);

export default router; 