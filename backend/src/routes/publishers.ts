import { Router, RequestHandler } from 'express';
import { 
  getAllPublishers, 
  getPublisherById, 
  createPublisher, 
  updatePublisher, 
  deletePublisher 
} from '../controllers/publishers';
import { auth } from '../middleware/auth';

const router = Router();

// GET /api/publishers - List all publishers
router.get('/', getAllPublishers as unknown as RequestHandler);

// GET /api/publishers/:id - Get publisher details
router.get('/:id', getPublisherById as unknown as RequestHandler);

// POST /api/publishers - Create new publisher (protected)
router.post('/', auth as RequestHandler, createPublisher as unknown as RequestHandler);

// PUT /api/publishers/:id - Update publisher (protected)
router.put('/:id', auth as RequestHandler, updatePublisher as unknown as RequestHandler);

// DELETE /api/publishers/:id - Delete publisher (protected)
router.delete('/:id', auth as RequestHandler, deletePublisher as unknown as RequestHandler);

export default router; 