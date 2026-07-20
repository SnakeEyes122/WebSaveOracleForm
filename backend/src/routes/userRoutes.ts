import { Router } from 'express';
import { getUsers, createUser, updateUser, deleteUser, getRoles } from '../controllers/userController';
import { authenticate, requireRole } from '../middlewares/authMiddleware';
import { validateRequest } from '../middlewares/validateRequest';
import { createUserSchema, updateUserSchema } from '../utils/schemas';

const router = Router();

// Only Admins can manage users and roles
router.use(authenticate);
router.use(requireRole(['Admin']));

router.get('/', getUsers);
router.get('/roles', getRoles);
router.post('/', validateRequest(createUserSchema), createUser);
router.put('/:id', validateRequest(updateUserSchema), updateUser);
router.delete('/:id', deleteUser);

export default router;
