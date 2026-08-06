// src/config/index.ts
import dotenv from 'dotenv';
import path from 'path';
import { envSchema, EnvConfig } from './env';

// Load .env file
dotenv.config();

function loadConfig(): EnvConfig {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('Invalid environment variables:', result.error.format());
    // Fall back to defaults for invalid or missing values
    return envSchema.parse({});
  }

  const config = result.data;
  // Resolve ROOT_DIR to absolute path
  config.ROOT_DIR = path.resolve(config.ROOT_DIR);
  return config;
}

export const config = loadConfig();
export default config;
