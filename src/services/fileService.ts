// src/services/fileService.ts
import fs from 'fs-extra';
import path from 'path';
import mime from 'mime-types';
import { glob } from 'glob';
import config from '../config';
import { FileInfo, FileNode, MediaType, SearchResult } from '../types';
import { EXCLUDED_PATTERNS, ICON_MAP, MEDIA_EXTENSIONS } from '../utils/constants';
import { sanitizePath } from '../utils/sanitize';

export class FileService {
  /**
   * List folder contents sorted (dirs first, then files alphabetically)
   */
  async getFolderContents(relPath: string = ''): Promise<FileInfo[]> {
    const fullPath = sanitizePath(relPath, config.ROOT_DIR);
    const stat = await fs.stat(fullPath);

    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${relPath}`);
    }

    const items = await fs.readdir(fullPath);
    const results: FileInfo[] = [];

    for (const item of items) {
      if (this.isExcluded(item)) continue;

      const itemFullPath = path.join(fullPath, item);
      const itemRelPath = path.relative(config.ROOT_DIR, itemFullPath).replace(/\\/g, '/');

      try {
        const itemInfo = await this.getFileInfo(itemRelPath);
        if (itemInfo) {
          results.push(itemInfo);
        }
      } catch {
        // Skip unreadable items
      }
    }

    // Sort: directories first, then alphabetically
    return results.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }

  /**
   * Get metadata for a single file or directory
   */
  async getFileInfo(relPath: string): Promise<FileInfo | null> {
    const fullPath = sanitizePath(relPath, config.ROOT_DIR);
    if (!await fs.pathExists(fullPath)) return null;

    const stat = await fs.stat(fullPath);
    const isDir = stat.isDirectory();
    const name = path.basename(fullPath);
    const ext = isDir ? '' : path.extname(name).slice(1).toLowerCase();

    const mediaType = isDir ? null : this.getMediaType(name);
    const mimeType = isDir ? 'directory' : (mime.lookup(name) || 'application/octet-stream');

    const icon = isDir ? ICON_MAP.folder : (ICON_MAP[ext] || ICON_MAP[mediaType || ''] || ICON_MAP.default);

    const isAudio = mediaType === 'audio';
    const isVideo = mediaType === 'video';
    const isImage = mediaType === 'image';

    return {
      name,
      path: fullPath,
      relativePath: relPath.replace(/\\/g, '/'),
      type: isDir ? 'directory' : 'file',
      icon,
      modified: stat.mtime.toISOString(),
      size: isDir ? 0 : stat.size,
      sizeFormatted: isDir ? '-' : this.formatSize(stat.size),
      mediaType,
      extension: ext,
      mimeType,
      isMedia: !!mediaType,
      isImage,
      isAudio,
      isVideo,
    };
  }

  /**
   * Recursively build tree structure up to specified depth
   */
  async getFileTree(relPath: string = '', depth: number = 2): Promise<FileNode[]> {
    const fullPath = sanitizePath(relPath, config.ROOT_DIR);
    const stat = await fs.stat(fullPath);
    if (!stat.isDirectory()) return [];

    const items = await fs.readdir(fullPath);
    const nodes: FileNode[] = [];

    for (const item of items) {
      if (this.isExcluded(item)) continue;

      const itemFullPath = path.join(fullPath, item);
      const itemRelPath = path.relative(config.ROOT_DIR, itemFullPath).replace(/\\/g, '/');

      try {
        const itemStat = await fs.stat(itemFullPath);
        const isDir = itemStat.isDirectory();
        const ext = isDir ? '' : path.extname(item).slice(1).toLowerCase();
        const mediaType = isDir ? null : this.getMediaType(item);
        const icon = isDir ? ICON_MAP.folder : (ICON_MAP[ext] || ICON_MAP[mediaType || ''] || ICON_MAP.default);

        const node: FileNode = {
          name: item,
          path: itemFullPath,
          relativePath: itemRelPath,
          type: isDir ? 'directory' : 'file',
          icon,
          size: isDir ? 0 : itemStat.size,
          mediaType,
          modified: itemStat.mtime.toISOString(),
          loaded: false,
        };

        if (isDir && depth > 1) {
          node.children = await this.getFileTree(itemRelPath, depth - 1);
          node.loaded = true;
        }

        nodes.push(node);
      } catch {
        // Skip inaccessible files
      }
    }

    return nodes.sort((a, b) => {
      if (a.type === 'directory' && b.type !== 'directory') return -1;
      if (a.type !== 'directory' && b.type === 'directory') return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }

  /**
   * Search files matching query in base path
   */
  async searchFiles(query: string, baseRelPath: string = ''): Promise<SearchResult[]> {
    const fullPath = sanitizePath(baseRelPath, config.ROOT_DIR);
    if (!query || query.trim().length === 0) return [];

    const cleanQuery = query.trim().toLowerCase();
    const results: SearchResult[] = [];

    // Helper to recursively walk directories
    const walk = async (dir: string) => {
      const items = await fs.readdir(dir);
      for (const item of items) {
        if (this.isExcluded(item)) continue;
        const itemPath = path.join(dir, item);
        try {
          const stat = await fs.stat(itemPath);
          const itemRel = path.relative(config.ROOT_DIR, itemPath).replace(/\\/g, '/');
          
          if (item.toLowerCase().includes(cleanQuery)) {
            const isDir = stat.isDirectory();
            const ext = isDir ? '' : path.extname(item).slice(1).toLowerCase();
            const mediaType = isDir ? null : this.getMediaType(item);
            const icon = isDir ? ICON_MAP.folder : (ICON_MAP[ext] || ICON_MAP[mediaType || ''] || ICON_MAP.default);

            results.push({
              name: item,
              path: itemPath,
              relativePath: itemRel,
              type: isDir ? 'directory' : 'file',
              icon,
              size: isDir ? 0 : stat.size,
              modified: stat.mtime.toISOString(),
              mediaType,
            });
          }

          if (stat.isDirectory()) {
            await walk(itemPath);
          }
        } catch {
          // ignore
        }
      }
    };

    await walk(fullPath);
    return results.slice(0, 100); // Limit results to 100 items
  }

  /**
   * Check if file or directory name is excluded
   */
  isExcluded(name: string): boolean {
    return EXCLUDED_PATTERNS.some((pattern) => pattern.test(name));
  }

  /**
   * Determine media category from filename extension
   */
  getMediaType(filename: string): MediaType {
    const ext = path.extname(filename).slice(1).toLowerCase();
    if (MEDIA_EXTENSIONS.audio.includes(ext)) return 'audio';
    if (MEDIA_EXTENSIONS.video.includes(ext)) return 'video';
    if (MEDIA_EXTENSIONS.image.includes(ext)) return 'image';
    return null;
  }

  /**
   * Format bytes to human readable string
   */
  formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const fileService = new FileService();
export default fileService;
