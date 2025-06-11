import { Router } from 'express';
import { getBoxSet } from '../controllers/boxsets';

const router = Router();

// GET /api/boxsets/:id - Get box set details
router.get('/:id', getBoxSet);

export default router; 