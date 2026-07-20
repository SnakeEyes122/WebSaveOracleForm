import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required')
});

export const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().optional(),
  role_id: z.number().positive()
});

export const updateUserSchema = z.object({
  full_name: z.string().optional(),
  role_id: z.number().positive().optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(6).optional()
});

export const systemSchema = z.object({
  name: z.string().min(1, 'System name is required'),
  description: z.string().optional()
});

export const fileTypeSchema = z.object({
  name: z.string().min(1, 'File type name is required').regex(/^[a-zA-Z0-9]+$/, 'Must contain only alphanumeric characters'),
  description: z.string().optional()
});
