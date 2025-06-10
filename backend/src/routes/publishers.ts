import { Router } from 'express';
import { 
  getAllPublishers, 
  getPublisher, 
  createPublisher, 
  updatePublisher, 
  deletePublisher 
} from '../controllers/publishers';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/publishers - List all publishers
router.get('/', getAllPublishers);

// GET /api/publishers/:slug - Get publisher details
router.get('/:slug', getPublisher);

// POST /api/publishers - Create new publisher (protected)
router.post('/', authenticateToken as any, createPublisher as any);

// PUT /api/publishers/:slug - Update publisher (protected)
router.put('/:slug', authenticateToken as any, updatePublisher as any);

// DELETE /api/publishers/:slug - Delete publisher (protected)
router.delete('/:slug', authenticateToken as any, deletePublisher as any);

export default router; 