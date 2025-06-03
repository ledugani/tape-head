import { Router } from 'express';
import { addToWantlist, getUserWantlist, deleteFromWantlist } from '../controllers/wantlist';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/wantlist - Get user's wantlist
router.get('/', authenticate as any, getUserWantlist as any);

// POST /api/wantlist - Add a tape to user's wantlist
router.post('/', authenticate as any, addToWantlist as any);

// DELETE /api/wantlist/:id - Delete a wantlist entry
router.delete('/:id', authenticate as any, deleteFromWantlist as any);

export default router; 