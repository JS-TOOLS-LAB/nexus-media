// src/controllers/searchController.ts
import { Request, Response, NextFunction } from 'express';
import fileService from '../services/fileService';

export class SearchController {
  /**
   * Search files matching query string
   */
  async search(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = (req.query.q as string) || '';
      const basePath = (req.query.path as string) || '';

      if (!query || query.trim().length === 0) {
        res.json({
          success: true,
          data: [],
          total: 0,
        });
        return;
      }

      const results = await fileService.searchFiles(query, basePath);

      res.json({
        success: true,
        data: results,
        total: results.length,
      });
    } catch (err) {
      next(err);
    }
  }
}

export const searchController = new SearchController();
export default searchController;
