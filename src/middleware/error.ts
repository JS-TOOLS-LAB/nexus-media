// src/middleware/error.ts
import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  logger.error(`${err.name}: ${err.message}\n${err.stack}`);

  const statusCode = (err as { status?: number }).status || 500;
  const message = config.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal Server Error'
    : err.message;

  if (req.originalUrl.startsWith('/api/')) {
    res.status(statusCode).json({
      success: false,
      error: message,
    });
    return;
  }

  res.status(statusCode).render('index', {
    appName: config.APP_NAME,
    user: req.session?.user || null,
    csrfToken: res.locals.csrfToken || '',
    error: message,
  });
}
