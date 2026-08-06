// src/routes/api.ts
import { Router } from 'express';
import fileController from '../controllers/fileController';
import mediaController from '../controllers/mediaController';
import searchController from '../controllers/searchController';
import treeService from '../services/treeService';
import { requireAuth } from '../middleware/auth';
import { apiLimiter } from '../middleware/rate-limit';

const router = Router();

// Apply authentication & rate limiting to all API endpoints
router.use(requireAuth);
router.use(apiLimiter);

// File tree sidebar
router.get('/tree', async (req, res, next) => {
  try {
    const relPath = (req.query.path as string) || '';
    const tree = await treeService.buildTree(relPath);
    res.json({
      success: true,
      data: tree,
    });
  } catch (err) {
    next(err);
  }
});

// Folder contents
router.get('/contents', (req, res, next) => {
  fileController.getContents(req, res, next);
});

// File info
router.get('/info', (req, res, next) => {
  fileController.getFileInfo(req, res, next);
});

// Media streaming
router.get('/media', (req, res, next) => {
  mediaController.streamMedia(req, res, next);
});

// Media info
router.get('/media-info', (req, res, next) => {
  mediaController.getMediaInfo(req, res, next);
});

// Single file download
router.get('/download', (req, res, next) => {
  fileController.downloadFile(req, res, next);
});

// Multiple files ZIP download
router.post('/download-zip', (req, res, next) => {
  fileController.downloadZip(req, res, next);
});

// Search files
router.get('/search', (req, res, next) => {
  searchController.search(req, res, next);
});

export default router;
