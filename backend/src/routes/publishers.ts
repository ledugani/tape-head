import { Router } from 'express';
import { 
  getAllPublishers, 
  getPublisherById, 
  createPublisher, 
  updatePublisher, 
  deletePublisher 
} from '../controllers/publishers';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// GET /api/publishers - List all publishers
router.get('/', getAllPublishers as any);

// GET /api/publishers/:id - Get publisher details
router.get('/:id', getPublisherById as any);

// POST /api/publishers - Create new publisher (protected)
router.post('/', authenticateToken as any, createPublisher as any);

// PUT /api/publishers/:id - Update publisher (protected)
router.put('/:id', authenticateToken as any, updatePublisher as any);

// DELETE /api/publishers/:id - Delete publisher (protected)
router.delete('/:id', authenticateToken as any, deletePublisher as any);

export default router; 