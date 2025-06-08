import { Router } from 'express';
import { register, login, getMe, verify, refresh } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/refresh', refresh as any);
router.get('/me', authenticateToken as any, getMe as any);
router.get('/verify', authenticateToken as any, verify as any);

export default router;
