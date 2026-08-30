import { Router } from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePin,
  verifyPin,
  logout,
} from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

export const authRoutes = Router();

authRoutes.post('/register', register);
authRoutes.post('/login', login);
authRoutes.post('/logout', logout);

// Protected auth routes
authRoutes.get('/me', authMiddleware, getMe);
authRoutes.put('/profile', authMiddleware, updateProfile);
authRoutes.put('/pin', authMiddleware, updatePin);
authRoutes.post('/verify-pin', authMiddleware, verifyPin);
