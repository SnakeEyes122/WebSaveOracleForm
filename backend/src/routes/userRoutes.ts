import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../controllers/userController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';

const router = Router();

// Only Admins can manage users and roles
router.use(authenticate);
router.use(requireRole(['Admin']));

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

router.get('/roles', getRoles);

export default router;
