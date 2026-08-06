// src/services/zipService.ts
import * as archiverModule from 'archiver';
const archiver = (archiverModule as any).default || archiverModule;
import fs from 'fs-extra';
import path from 'path';
import { Readable } from 'stream';
import config from '../config';
import { MAX_ZIP_SIZE } from '../utils/constants';
import { sanitizePath } from '../utils/sanitize';

export class ZipService {
  /**
   * Create streaming ZIP archive from multiple file/folder relative paths
   */
  async createZipStream(relPaths: string[]): Promise<{ stream: Readable; totalSize: number }> {
    const validPaths = await this.validateFiles(relPaths);
    const totalSize = await this.getTotalSize(validPaths);

    if (totalSize > MAX_ZIP_SIZE) {
      throw new Error(`Total size exceeds maximum ZIP limit of ${MAX_ZIP_SIZE / (1024 * 1024)} MB`);
    }

    const archive = archiver('zip', {
      zlib: { level: 6 },
    });

    for (const relPath of validPaths) {
      const fullPath = sanitizePath(relPath, config.ROOT_DIR);
      const stat = await fs.stat(fullPath);
      const entryName = path.basename(fullPath);

      if (stat.isDirectory()) {
        archive.directory(fullPath, entryName);
      } else if (stat.isFile()) {
        archive.file(fullPath, { name: entryName });
      }
    }

    archive.finalize();
    return {
      stream: archive as unknown as Readable,
      totalSize,
    };
  }

  /**
   * Filter out invalid, non-existent or dangerous paths
   */
  async validateFiles(relPaths: string[]): Promise<string[]> {
    const valid: string[] = [];

    for (const relPath of relPaths) {
      try {
        const fullPath = sanitizePath(relPath, config.ROOT_DIR);
        if (await fs.pathExists(fullPath)) {
          valid.push(relPath);
        }
      } catch {
        // Ignore invalid paths
      }
    }

    if (valid.length === 0) {
      throw new Error('No valid files or directories selected for download');
    }

    return valid;
  }

  /**
   * Calculate total size of files/folders
   */
  async getTotalSize(relPaths: string[]): Promise<number> {
    let total = 0;

    for (const relPath of relPaths) {
      const fullPath = sanitizePath(relPath, config.ROOT_DIR);
      const stat = await fs.stat(fullPath);
      if (stat.isFile()) {
        total += stat.size;
      } else if (stat.isDirectory()) {
        total += await this.getDirectorySize(fullPath);
      }
    }

    return total;
  }

  private async getDirectorySize(dirPath: string): Promise<number> {
    let size = 0;
    const items = await fs.readdir(dirPath);
    for (const item of items) {
      const full = path.join(dirPath, item);
      const stat = await fs.stat(full);
      if (stat.isFile()) {
        size += stat.size;
      } else if (stat.isDirectory()) {
        size += await this.getDirectorySize(full);
      }
    }
    return size;
  }
}

export const zipService = new ZipService();
export default zipService;
