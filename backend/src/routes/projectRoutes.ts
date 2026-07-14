import { Router } from 'express';
import { getProjects, createProject, updateProject, deleteProject } from '../controllers/projectController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.post('/', requireRole(['Admin', 'Developer']), createProject);
router.put('/:id', requireRole(['Admin', 'Developer']), updateProject);
router.delete('/:id', requireRole(['Admin']), deleteProject);

export default router;
