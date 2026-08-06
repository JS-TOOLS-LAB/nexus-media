// src/controllers/mediaController.ts
import { Request, Response, NextFunction } from 'express';
import mediaService from '../services/mediaService';
import logger from '../utils/logger';

export class MediaController {
  /**
   * Stream media with Range header support
   */
  async streamMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const relPath = (req.query.path as string) || '';
      if (!relPath) {
        res.status(400).json({ success: false, error: 'Path parameter required' });
        return;
      }

      const range = req.headers.range;
      const mediaRes = await mediaService.streamMedia(relPath, range);

      if (mediaRes.isPartial) {
        res.status(206);
        res.setHeader('Content-Range', `bytes ${mediaRes.start}-${mediaRes.end}/${mediaRes.totalSize}`);
      } else {
        res.status(200);
      }

      res.setHeader('Content-Type', mediaRes.mimeType);
      res.setHeader('Content-Length', mediaRes.contentLength);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Cache-Control', 'public, max-age=3600');

      mediaRes.stream.pipe(res);
    } catch (err) {
      if ((err as Error).message === 'Requested Range Not Satisfiable') {
        res.status(416).json({ success: false, error: 'Range Not Satisfiable' });
        return;
      }
      next(err);
    }
  }

  /**
   * Get metadata info for media file
   */
  async getMediaInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const relPath = (req.query.path as string) || '';
      if (!relPath) {
        res.status(400).json({ success: false, error: 'Path parameter required' });
        return;
      }

      const info = await mediaService.getMediaInfo(relPath);
      res.json({
        success: true,
        data: info,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const mediaController = new MediaController();
export default mediaController;
