// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import config from '../config';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // If authentication is disabled in config
  if (!config.REQUIRE_LOGIN) {
    req.user = req.session.user || { username: 'guest', role: 'guest' };
    return next();
  }

  // Check if session has user
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }

  // API requests return 401 JSON
  if (req.originalUrl.startsWith('/api/')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication required',
    });
    return;
  }

  // Web pages redirect to /login
  res.redirect('/login');
}
