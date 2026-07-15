import { Router } from 'express';
import { getFileTypes, createFileType, updateFileType, deleteFileType } from '../controllers/fileTypeController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

router.use(authenticate);

// All authenticated users can view file types
router.get('/', getFileTypes);

// Admin and Developer can create
router.post('/', requireRole(['Admin', 'Developer']), createFileType);

// Only Admin can edit or delete
router.put('/:id', requireRole(['Admin']), updateFileType);
router.delete('/:id', requireRole(['Admin']), deleteFileType);

export default router;
