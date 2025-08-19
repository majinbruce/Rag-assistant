import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting for authentication endpoints
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many authentication attempts. Please try again in 15 minutes.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for password reset
export const passwordResetRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts. Please try again in 1 hour.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Disable for development
});

// Middleware to log suspicious activities
export const logSuspiciousActivity = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log failed authentication attempts
    if (res.statusCode === 401 && req.path.includes('/auth/')) {
      console.warn(`Failed authentication attempt:`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        timestamp: new Date().toISOString(),
        body: req.body ? { email: req.body.email } : undefined // Only log email, not password
      });
    }
    
    // Log suspicious patterns
    if (res.statusCode === 429) {
      console.warn(`Rate limit exceeded:`, {
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        path: req.path,
        timestamp: new Date().toISOString()
      });
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};