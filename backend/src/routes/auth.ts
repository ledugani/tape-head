import { Router } from 'express';
import { register, login, getMe, verify, refresh } from '../controllers/auth';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/register', register as any);
router.post('/login', login as any);
router.post('/refresh', refresh as any);
router.get('/me', authenticateToken as any, getMe as any);
router.get('/verify', authenticateToken as any, verify as any);

// In src/routes/auth.ts
router.post('/logout', (req, res) => {
	// If using JWTs, you may not need to do anything server-side,
	// but you could blacklist the token, invalidate the refresh token, etc.
	// For now, just return a 200 OK.
	res.status(200).json({ message: 'Logged out' });
});

export default router;
