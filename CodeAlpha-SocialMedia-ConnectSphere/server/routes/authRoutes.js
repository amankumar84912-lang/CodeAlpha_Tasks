import express from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';

const router = express.Router();

router.post('/register', authLimiter, validateRegister, register);
router.post('/login', authLimiter, validateLogin, login);
router.get('/profile', protect, getProfile);

export default router;
