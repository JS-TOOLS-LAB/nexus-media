// src/services/mediaService.ts
import fs from 'fs-extra';
import mime from 'mime-types';
import path from 'path';
import config from '../config';
import { MediaInfo, MediaStreamResponse } from '../types';
import { MEDIA_EXTENSIONS } from '../utils/constants';
import { sanitizePath } from '../utils/sanitize';

export class MediaService {
  /**
   * Stream media file with Range header support (HTTP 206 / HTTP 200)
   */
  async streamMedia(relPath: string, range?: string): Promise<MediaStreamResponse> {
    const fullPath = sanitizePath(relPath, config.ROOT_DIR);
    if (!await fs.pathExists(fullPath)) {
      throw new Error('Media file not found');
    }

    const stat = await fs.stat(fullPath);
    if (!stat.isFile()) {
      throw new Error('Target is not a file');
    }

    const totalSize = stat.size;
    const mimeType = this.getMimeType(fullPath);

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (start >= totalSize || end >= totalSize) {
        throw new Error('Requested Range Not Satisfiable');
      }

      const contentLength = end - start + 1;
      const stream = fs.createReadStream(fullPath, { start, end });

      return {
        stream,
        mimeType,
        contentLength,
        start,
        end,
        totalSize,
        isPartial: true,
      };
    }

    // Full file stream
    const stream = fs.createReadStream(fullPath);
    return {
      stream,
      mimeType,
      contentLength: totalSize,
      start: 0,
      end: totalSize - 1,
      totalSize,
      isPartial: false,
    };
  }

  /**
   * Get basic metadata for media file
   */
  async getMediaInfo(relPath: string): Promise<MediaInfo> {
    const fullPath = sanitizePath(relPath, config.ROOT_DIR);
    const stat = await fs.stat(fullPath);
    const name = path.basename(fullPath);
    const mimeType = this.getMimeType(fullPath);

    return {
      name,
      size: stat.size,
      mimeType,
    };
  }

  isAudioFile(filename: string): boolean {
    const ext = path.extname(filename).slice(1).toLowerCase();
    return MEDIA_EXTENSIONS.audio.includes(ext);
  }

  isVideoFile(filename: string): boolean {
    const ext = path.extname(filename).slice(1).toLowerCase();
    return MEDIA_EXTENSIONS.video.includes(ext);
  }

  isImageFile(filename: string): boolean {
    const ext = path.extname(filename).slice(1).toLowerCase();
    return MEDIA_EXTENSIONS.image.includes(ext);
  }

  getMimeType(filename: string): string {
    return mime.lookup(filename) || 'application/octet-stream';
  }
}

export const mediaService = new MediaService();
export default mediaService;
