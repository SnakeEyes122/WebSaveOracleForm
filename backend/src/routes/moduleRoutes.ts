import { Router } from 'express';
import { getModules, createModule, updateModule, deleteModule } from '../controllers/moduleController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getModules);
router.post('/', requireRole(['Admin', 'Developer']), createModule);
router.put('/:id', requireRole(['Admin', 'Developer']), updateModule);
router.delete('/:id', requireRole(['Admin']), deleteModule);

export default router;
