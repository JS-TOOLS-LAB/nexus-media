// src/routes/auth.ts
import { Router } from 'express';
import authController from '../controllers/authController';
import { loginLimiter } from '../middleware/rate-limit';

const router = Router();

router.get('/login', (req, res, next) => {
  authController.loginPage(req, res).catch(next);
});

router.post('/login', loginLimiter, (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.get('/logout', (req, res, next) => {
  authController.logout(req, res).catch(next);
});

router.post('/logout', (req, res, next) => {
  authController.logout(req, res).catch(next);
});

export default router;
