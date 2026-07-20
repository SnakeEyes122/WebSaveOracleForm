import { Request, Response } from 'express';
import { loginUser } from '../services/authService';
import { createAuditLog } from '../services/auditService';
import { verifyToken, generateToken } from '../utils/jwt';

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const { user, token, refreshToken } = await loginUser(username, password);
    
    // Create an Audit Log for login
    await createAuditLog({
      userId: user.id,
      action: 'Login',
      ipAddress: req.ip || undefined
    });
    
    const roleObj = Array.isArray(user.roles) ? user.roles[0] : user.roles;
    
    // Set refresh token in HTTP-only cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

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

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const rfToken = req.cookies.refreshToken;
    if (!rfToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

    const decoded = verifyToken(rfToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Generate new short-lived access token
    const newToken = generateToken({
      id: decoded.id,
      username: decoded.username,
      role: decoded.role
    });

    res.status(200).json({ token: newToken });
  } catch (error: any) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const logout = async (req: Request, res: Response) => {
  if (req.user) {
    await createAuditLog({
      userId: req.user.id,
      action: 'Logout',
      ipAddress: req.ip || undefined
    });
  }
  
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logout successful' });
};
