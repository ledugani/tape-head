import { Router, RequestHandler } from 'express';
import { addToWantlist, getUserWantlist, deleteFromWantlist } from '../controllers/wantlist';
import { auth } from '../middleware/auth';

const router = Router();

// GET /api/wantlist - Get user's wantlist
router.get('/', auth as RequestHandler, getUserWantlist as unknown as RequestHandler);

// POST /api/wantlist - Add a tape to user's wantlist
router.post('/', auth as RequestHandler, addToWantlist as unknown as RequestHandler);

// DELETE /api/wantlist/:id - Delete a wantlist entry
router.delete('/:id', auth as RequestHandler, deleteFromWantlist as unknown as RequestHandler);

export default router; 