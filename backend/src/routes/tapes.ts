import { Router } from 'express';
import { getAllTapes, getTapeById } from '../controllers/tapes';

const router = Router();

// GET /api/tapes - Get all tapes
router.get('/', getAllTapes as any);

// GET /api/tapes/:id - Get a single tape by ID
router.get('/:id', getTapeById as any);

export default router; 