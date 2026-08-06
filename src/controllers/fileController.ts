// src/controllers/fileController.ts
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs-extra';
import fileService from '../services/fileService';
import zipService from '../services/zipService';
import config from '../config';
import { sanitizePath } from '../utils/sanitize';
import logger from '../utils/logger';

export class FileController {
  /**
   * Get folder contents
   */
  async getContents(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const relPath = (req.query.path as string) || '';
      const contents = await fileService.getFolderContents(relPath);
      
      res.json({
        success: true,
        path: relPath,
        data: contents,
        total: contents.length,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Stream download single file
   */
  async downloadFile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const relPath = (req.query.path as string) || '';
      if (!relPath) {
        res.status(400).json({ success: false, error: 'Path parameter required' });
        return;
      }

      const fullPath = sanitizePath(relPath, config.ROOT_DIR);
      if (!await fs.pathExists(fullPath)) {
        res.status(404).json({ success: false, error: 'File not found' });
        return;
      }

      const stat = await fs.stat(fullPath);
      if (!stat.isFile()) {
        res.status(400).json({ success: false, error: 'Cannot download directory directly. Use ZIP download.' });
        return;
      }

      const filename = path.basename(fullPath);
      res.download(fullPath, filename, (err) => {
        if (err) {
          logger.error(`Error sending download file ${filename}: ${err}`);
        }
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * Download multiple files / folders as ZIP archive
   */
  async downloadZip(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      let paths: string[] = [];

      if (Array.isArray(req.body.paths)) {
        paths = req.body.paths;
      } else if (typeof req.body.paths === 'string') {
        paths = [req.body.paths];
      } else if (req.query.paths) {
        paths = (req.query.paths as string).split(',');
      }

      if (!paths || paths.length === 0) {
        res.status(400).json({ success: false, error: 'No files specified for ZIP download' });
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const zipFilename = `media-export-${timestamp}.zip`;

      const { stream } = await zipService.createZipStream(paths);

      res.attachment(zipFilename);
      res.setHeader('Content-Type', 'application/zip');

      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Get metadata info for a single file or directory
   */
  async getFileInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const relPath = (req.query.path as string) || '';
      const info = await fileService.getFileInfo(relPath);
      
      if (!info) {
        res.status(404).json({ success: false, error: 'File not found' });
        return;
      }

      res.json({
        success: true,
        data: info,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const fileController = new FileController();
export default fileController;
