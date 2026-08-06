// src/middleware/security.ts
import helmet from 'helmet';

export const securityMiddleware = helmet({
  frameguard: false,
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
});

