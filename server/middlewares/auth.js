import jwt from 'jsonwebtoken';
import { UserModel } from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ 
        error: 'Invalid token. User not found.',
        code: 'USER_NOT_FOUND'
      });
    }

    // Add user info to request
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired. Please login again.',
        code: 'TOKEN_EXPIRED'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token.',
        code: 'INVALID_TOKEN'
      });
    } else {
      console.error('Auth middleware error:', error);
      return res.status(500).json({ 
        error: 'Authentication error.',
        code: 'AUTH_ERROR'
      });
    }
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      // No token provided, continue without authentication
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await UserModel.findById(decoded.userId);
    
    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email
      };
    } else {
      req.user = null;
    }
    
    next();
  } catch (error) {
    // Token is invalid, continue without authentication
    req.user = null;
    next();
  }
};

export const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

export const verifyRefreshToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};