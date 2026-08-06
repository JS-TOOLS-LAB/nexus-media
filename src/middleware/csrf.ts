// src/middleware/csrf.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Ensure session has a CSRF token
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(24).toString('hex');
  }

  // Make CSRF token available in template views
  res.locals.csrfToken = req.session.csrfToken;

  // State changing methods require CSRF validation
  if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
    // Exempt /login route to allow session establishment in iframe environments
    if (req.path === '/login') {
      next();
      return;
    }

    const token =
      (req.headers['x-csrf-token'] as string) ||
      (req.body && req.body._csrf) ||
      (req.query && req.query._csrf);

    if (!token || token !== req.session.csrfToken) {
      if (req.originalUrl.startsWith('/api/')) {
        res.status(403).json({
          success: false,
          error: 'Forbidden: Invalid or missing CSRF token',
        });
        return;
      }
      res.status(403).send('Forbidden: Invalid CSRF Token');
      return;
    }
  }

  next();
}
