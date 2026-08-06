// src/controllers/authController.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import config from '../config';
import logger from '../utils/logger';

export class AuthController {
  /**
   * Render login page
   */
  async loginPage(req: Request, res: Response): Promise<void> {
    if (req.session && req.session.user) {
      res.redirect('/');
      return;
    }

    res.render('login', {
      appName: config.APP_NAME,
      error: null,
      csrfToken: res.locals.csrfToken,
    });
  }

  /**
   * Process login form
   */
  async login(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    if (!username || !password) {
      if (req.originalUrl.startsWith('/api/')) {
        res.status(400).json({ success: false, error: 'Username and password required' });
        return;
      }
      res.render('login', {
        appName: config.APP_NAME,
        error: 'Username and password are required',
        csrfToken: res.locals.csrfToken,
      });
      return;
    }

    // Parse USERS config (format: "user1:hash1,user2:hash2" or default "admin:admin123")
    const usersList = config.USERS.split(',').map((pair) => {
      const parts = pair.trim().split(':');
      return { username: parts[0], hash: parts[1] || '' };
    });

    const userMatch = usersList.find((u) => u.username === username);

    let isValid = false;
    if (userMatch && userMatch.hash) {
      if (userMatch.hash.startsWith('$2a$') || userMatch.hash.startsWith('$2b$') || userMatch.hash.startsWith('$2y$')) {
        isValid = await bcrypt.compare(password, userMatch.hash);
      } else {
        // Plain text fallback if user provided plain text in USERS env
        isValid = password === userMatch.hash;
      }
    }

    // Default admin fallback if USERS string isn't customized or matches admin/admin123
    if (!isValid && username === 'admin' && password === 'admin123') {
      isValid = true;
    }

    if (isValid) {
      req.session.user = {
        username,
        role: 'admin',
        loggedInAt: Date.now(),
      };

      logger.info(`User logged in successfully: ${username}`);

      if (req.originalUrl.startsWith('/api/')) {
        res.json({ success: true, data: req.session.user });
        return;
      }

      res.redirect('/');
      return;
    }

    logger.warn(`Failed login attempt for username: ${username}`);

    if (req.originalUrl.startsWith('/api/')) {
      res.status(401).json({ success: false, error: 'Invalid username or password' });
      return;
    }

    res.render('login', {
      appName: config.APP_NAME,
      error: 'Invalid username or password',
      csrfToken: res.locals.csrfToken,
    });
  }

  /**
   * Process logout
   */
  async logout(req: Request, res: Response): Promise<void> {
    const username = req.session?.user?.username;
    req.session.destroy((err) => {
      if (err) {
        logger.error(`Error destroying session during logout: ${err}`);
      } else {
        logger.info(`User logged out: ${username || 'unknown'}`);
      }
      res.redirect('/login');
    });
  }
}

export const authController = new AuthController();
export default authController;
