import { Router } from 'express';
import { login, logout, refreshToken } from '../controllers/authController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { loginSchema } from '../utils/schemas';
import rateLimit from 'express-rate-limit';
import { notifyAdmins } from '../services/notificationService';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per `window`
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' },
  handler: async (req, res, next, options) => {
    // Notify admins asynchronously
    notifyAdmins(
      'Suspicious Activity Detected',
      `Multiple failed login attempts detected from IP: ${req.ip}`
    );
    res.status(options.statusCode).json(options.message);
  }
});

router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);

export default router;
