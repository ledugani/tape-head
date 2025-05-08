import { Router, RequestHandler } from 'express';
import { register, login, getMe } from '../controllers/auth';
import { auth } from '../middleware/auth';

const router = Router();

router.post('/register', register as RequestHandler);
router.post('/login', login as RequestHandler);
router.get('/me', auth as RequestHandler, getMe as RequestHandler);

export default router; 