import { Router } from 'express';
import { getSystems, createSystem, updateSystem, deleteSystem } from '../controllers/systemController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { systemSchema } from '../utils/schemas';

const router = Router();

router.use(authenticate);

// Everyone can view systems
router.get('/', getSystems);

// Admin and Developer can create systems, but only Admin can edit/delete
router.post('/', requireRole(['Admin']), validateRequest(systemSchema), createSystem);
router.put('/:id', requireRole(['Admin']), validateRequest(systemSchema), updateSystem);
router.delete('/:id', requireRole(['Admin']), deleteSystem);

export default router;
