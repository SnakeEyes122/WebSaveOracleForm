import { Request, Response } from 'express';
import { loginUser } from '../services/authService';
import { createAuditLog } from '../services/auditService';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { user, token } = await loginUser(username, password);
    
    // Create an Audit Log for login
    await createAuditLog({
      userId: user.id,
      action: 'Login',
      ipAddress: req.ip || undefined
    });
    
    // Typecast to handle Supabase TS inference
    const roleObj = Array.isArray(user.roles) ? user.roles[0] : user.roles;
    
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: roleObj?.name
      },
      token
    });
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  // If we require auth for logout, we can log it.
  if (req.user) {
    await createAuditLog({
      userId: req.user.id,
      action: 'Logout',
      ipAddress: req.ip || undefined
    });
  }
  res.status(200).json({ message: 'Logout successful' });
};
