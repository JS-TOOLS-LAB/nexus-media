// src/config/env.ts
import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  SESSION_SECRET: z.string().min(16).default('media_explorer_secret_session_key_32bytes_long'),
  ROOT_DIR: z.string().default(process.cwd()),
  REQUIRE_LOGIN: z.string().default('true').transform((val) => val.toLowerCase() === 'false' || val === '0'),
  SESSION_TIMEOUT: z.string().default('28800').transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: z.string().default('100').transform((val) => parseInt(val, 10)),
  LOGIN_RATE_LIMIT: z.string().default('5').transform((val) => parseInt(val, 10)),
  USERS: z.string().default('admin:$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym524.3pSnyMml08269h.S'),
  APP_NAME: z.string().default('Media Explorer'),
  APP_DEBUG: z.string().default('false').transform((val) => val.toLowerCase() === 'true' || val === '1'),
});

export type EnvConfig = z.infer<typeof envSchema>;
