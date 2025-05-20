import { Router, RequestHandler } from 'express';
import { addToWantlist } from '../controllers/wantlist';
import { auth } from '../middleware/auth';

const router = Router();

// POST /api/wantlist - Add a tape to user's wantlist
router.post('/', auth as RequestHandler, addToWantlist as RequestHandler);

export default router; 