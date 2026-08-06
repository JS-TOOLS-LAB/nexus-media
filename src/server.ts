// src/server.ts
import fs from 'fs-extra';
import path from 'path';
import app from './app';
import config from './config';
import logger from './utils/logger';

// Seed sample media files if running in demo environment and folder doesn't exist
async function seedDemoFiles() {
  const demoDir = path.join(config.ROOT_DIR, 'Media_Library');
  try {
    if (!await fs.pathExists(demoDir)) {
      await fs.ensureDir(path.join(demoDir, 'Music'));
      await fs.ensureDir(path.join(demoDir, 'Videos'));
      await fs.ensureDir(path.join(demoDir, 'Images'));
      await fs.ensureDir(path.join(demoDir, 'Documents'));

      // Create a sample SVG image
      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="50%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#bg)" />
        <circle cx="400" cy="250" r="120" fill="#38bdf8" opacity="0.8" />
        <polygon points="360,190 470,250 360,310" fill="#ffffff" />
        <text x="400" y="440" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">Media Explorer Sample</text>
        <text x="400" y="480" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle">TypeScript & Node.js Media Server</text>
      </svg>`;
      await fs.writeFile(path.join(demoDir, 'Images', 'sample_banner.svg'), sampleSvg, 'utf-8');

      // Create sample text document
      const sampleTxt = `# Media Explorer Demo

Welcome to Media Explorer!

Features included:
- File tree navigation
- Media streaming (Audio, Video, Images)
- Session-based Authentication
- ZIP Batch Downloads
- Live Search & Filtering
- Dark & Light Themes
`;
      await fs.writeFile(path.join(demoDir, 'Documents', 'readme.txt'), sampleTxt, 'utf-8');

      logger.info('Sample Media Library seeded successfully');
    }
  } catch (err) {
    logger.error(`Error seeding demo files: ${err}`);
  }
}

async function start() {
  await seedDemoFiles();

  const PORT = config.PORT || 3000;
  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`==================================================`);
    logger.info(`🚀 ${config.APP_NAME} running on http://0.0.0.0:${PORT}`);
    logger.info(`📁 Root Directory: ${config.ROOT_DIR}`);
    logger.info(`🔒 Require Auth: ${config.REQUIRE_LOGIN}`);
    logger.info(`==================================================`);
  });

  // Graceful shutdown handling
  const shutdown = (signal: string) => {
    logger.info(`${signal} received: closing HTTP server...`);
    server.close(() => {
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  process.on('uncaughtException', (err) => {
    logger.error(`Uncaught Exception: ${err.message}\n${err.stack}`);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error(`Unhandled Rejection: ${reason}`);
  });
}

start();
