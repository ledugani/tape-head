import { Router } from 'express';
import { register, login, getMe, verify, refresh } from '../controllers/auth';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/refresh', refresh as any);
router.get('/me', authenticate as any, getMe as any);
router.get('/verify', authenticate as any, verify as any);

export default router; 