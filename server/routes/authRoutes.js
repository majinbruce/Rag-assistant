import express from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticateToken } from '../middlewares/auth.js';
import { 
  validateRegistration, 
  validateLogin, 
  validateTokenRefresh 
} from '../middlewares/validation.js';
import { 
  authRateLimit, 
  passwordResetRateLimit 
} from '../middlewares/security.js';

const router = express.Router();
const authController = new AuthController();

// Public routes
router.post('/register', 
  authRateLimit,
  validateRegistration,
  (req, res) => authController.register(req, res)
);

router.post('/login', 
  authRateLimit,
  validateLogin,
  (req, res) => authController.login(req, res)
);

router.post('/refresh-token', 
  validateTokenRefresh,
  (req, res) => authController.refreshToken(req, res)
);

router.post('/logout', 
  (req, res) => authController.logout(req, res)
);

// Protected routes (require authentication)
router.get('/me', 
  authenticateToken,
  (req, res) => authController.getCurrentUser(req, res)
);

router.put('/password', 
  authenticateToken,
  passwordResetRateLimit,
  // Add validation for password update
  (req, res) => authController.updatePassword(req, res)
);

export default router;