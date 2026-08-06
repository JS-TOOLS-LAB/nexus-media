// src/app.ts
import express from 'express';
import session from 'express-session';
import path from 'path';
import config from './config';
import { securityMiddleware } from './middleware/security';
import { csrfProtection } from './middleware/csrf';
import { errorHandler } from './middleware/error';
import routes from './routes';

const app = express();

// Trust reverse proxy (Cloud Run / Nginx)
app.set('trust proxy', 1);

// View Engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));

// 1. Security Headers (Helmet)
app.use(securityMiddleware);

// 2. Parse request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. Session management
app.use(
  session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: config.SESSION_TIMEOUT * 1000,
    },
  })
);

// 4. CSRF protection
app.use(csrfProtection);

// 5. Serve static files from public/ directory
app.use(express.static(path.join(process.cwd(), 'public')));

// 6. Application routes
app.use('/', routes);

// 7. Global error handling
app.use(errorHandler);

export default app;
