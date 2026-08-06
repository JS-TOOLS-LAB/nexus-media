// src/routes/index.ts
import { Router } from 'express';
import authRoutes from './auth';
import apiRoutes from './api';
import { requireAuth } from '../middleware/auth';
import config from '../config';

const router = Router();

// Mount authentication routes (/login, /logout)
router.use('/', authRoutes);

// Mount API routes (/api/*)
router.use('/api', apiRoutes);

// Main Explorer Page
router.get('/', requireAuth, (req, res) => {
  res.render('index', {
    appName: config.APP_NAME,
    user: req.user || req.session?.user || { username: 'guest' },
    csrfToken: res.locals.csrfToken,
    error: null,
  });
});

// Catch-all route for SPA behavior -> render index view
router.get('*', requireAuth, (req, res) => {
  if (req.originalUrl.startsWith('/api/')) {
    res.status(404).json({ success: false, error: 'API endpoint not found' });
    return;
  }
  res.render('index', {
    appName: config.APP_NAME,
    user: req.user || req.session?.user || { username: 'guest' },
    csrfToken: res.locals.csrfToken,
    error: null,
  });
});

export default router;
