import { Router } from 'express';
import { getNotifications, markAsRead, toggleSubscription, getSubscriptions } from '../controllers/notificationController';
import { authenticate } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { z } from 'zod';

const router = Router();

// Zod schema for toggling subscription
const toggleSubSchema = z.object({
  system_id: z.string().uuid('Invalid System ID format')
});

router.use(authenticate); // All routes require auth

router.get('/', getNotifications);
router.post('/read', markAsRead);
router.get('/subscriptions', getSubscriptions);
router.post('/subscribe', validateRequest(toggleSubSchema), toggleSubscription);

export default router;
