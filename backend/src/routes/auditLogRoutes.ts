import { Router } from 'express';
import { getAuditLogs } from '../controllers/auditLogController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();
router.use(authenticate);
router.use(requireRole(['Admin']));
router.get('/', getAuditLogs);

export default router;
