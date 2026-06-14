import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '123456789abcdef';

// Extend Express Request object to include user payload
export interface AuthRequest extends Request {
  user?: any;
}

// Generate 
export const generateToken = (payload: object, expiresIn: string | number = '1d') => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
};

// Verify
export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET);
};

// Auth
export const authenticateJWT = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    // Expected format: "Bearer <token>"
    const token = authHeader.split(' ')[1];

    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (err) {
        res.status(403).json({ message: 'Forbidden: Invalid or expired token' });
        return;
      }

      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
};
