import { Router } from 'express';
import { getSystems, createSystem, updateSystem, deleteSystem } from '../controllers/systemController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

// All authenticated users can view systems
router.get('/', getSystems);

// Admin and Developer can create
router.post('/', requireRole(['Admin', 'Developer']), createSystem);

// Only Admin can edit or delete
router.put('/:id', requireRole(['Admin']), updateSystem);
router.delete('/:id', requireRole(['Admin']), deleteSystem);

export default router;
