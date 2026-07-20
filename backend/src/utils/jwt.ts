import jwt from 'jsonwebtoken';
import { config } from '../config/env';

export interface JwtPayload {
  id: string;
  username: string;
  role: string;
}

export const generateToken = (payload: JwtPayload): string => {
  // Shorter lifespan for access token (e.g. 15 minutes)
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: JwtPayload): string => {
  // Longer lifespan for refresh token (e.g. 7 days)
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    return null;
  }
};
