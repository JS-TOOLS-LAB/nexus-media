// src/utils/logger.ts
import winston from 'winston';
import config from '../config';

const logFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
});

export const logger = winston.createLogger({
  level: config.APP_DEBUG ? 'debug' : 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        logFormat
      ),
    }),
  ],
});

export default logger;
