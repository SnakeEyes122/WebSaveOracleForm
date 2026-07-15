import { Router } from 'express';
import multer from 'multer';
import { uploadFiles, getFiles, getFileVersions, downloadFile, updateFile, deleteFile } from '../controllers/fileController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Configure multer for memory storage (we upload to Supabase directly)
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.use(authenticate);

// Admin and Developer can upload
router.post('/upload', requireRole(['Admin', 'Developer']), upload.array('files'), uploadFiles);

// Anyone authenticated can list files and download
router.get('/', getFiles);
router.get('/:id/versions', getFileVersions);
router.get('/download/:id', downloadFile);

// Admin only operations on files
router.put('/:id', requireRole(['Admin']), updateFile);
router.delete('/:id', requireRole(['Admin']), deleteFile);

export default router;
