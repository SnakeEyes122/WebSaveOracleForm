import { Router } from 'express';
import { getFileTypes, createFileType, updateFileType, deleteFileType } from '../controllers/fileTypeController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { fileTypeSchema } from '../utils/schemas';

const router = Router();

router.use(authenticate);

// Everyone can view file types
router.get('/', getFileTypes);

// Only Admin can manage file types
router.post('/', requireRole(['Admin']), validateRequest(fileTypeSchema), createFileType);
router.put('/:id', requireRole(['Admin']), validateRequest(fileTypeSchema), updateFileType);
router.delete('/:id', requireRole(['Admin']), deleteFileType);

export default router;
