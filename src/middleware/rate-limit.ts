// src/middleware/rate-limit.ts
import rateLimit from 'express-rate-limit';
import config from '../config';

export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: config.RATE_LIMIT_MAX, // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests, please try again later.',
  },
});

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.LOGIN_RATE_LIMIT, // 5 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: (req, res) => {
    if (req.originalUrl.startsWith('/api/')) {
      return res.status(429).json({
        success: false,
        error: 'Too many login attempts. Please try again after 15 minutes.',
      });
    }
    return res.status(429).send('Too many login attempts. Please try again after 15 minutes.');
  },
});
