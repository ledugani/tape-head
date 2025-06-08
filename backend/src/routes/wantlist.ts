import { Router } from 'express';
import { addToWantlist, getUserWantlist, deleteFromWantlist } from '../controllers/wantlist';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/wantlist - Get user's wantlist
router.get('/', authenticateToken as any, getUserWantlist as any);

// POST /api/wantlist - Add a tape to user's wantlist
router.post('/', authenticateToken as any, addToWantlist as any);

// DELETE /api/wantlist/:id - Delete a wantlist entry
router.delete('/:id', authenticateToken as any, deleteFromWantlist as any);

export default router; 