// src/services/treeService.ts
import fileService from './fileService';
import { FileNode } from '../types';
import config from '../config';
import { sanitizePath } from '../utils/sanitize';
import path from 'path';
import fs from 'fs-extra';
import { ICON_MAP } from '../utils/constants';

export class TreeService {
  /**
   * Build complete tree starting from root path
   */
  async buildTree(rootRelPath: string = ''): Promise<FileNode[]> {
    return fileService.getFileTree(rootRelPath, 2);
  }

  /**
   * Get a specific tree node with its details
   */
  async getTreeNode(relPath: string): Promise<FileNode> {
    const fullPath = sanitizePath(relPath, config.ROOT_DIR);
    const stat = await fs.stat(fullPath);
    const name = relPath ? path.basename(fullPath) : 'Root';
    const isDir = stat.isDirectory();
    const mediaType = isDir ? null : fileService.getMediaType(name);
    const icon = isDir ? ICON_MAP.folder : (ICON_MAP[mediaType || ''] || ICON_MAP.default);

    const children = isDir ? await fileService.getFileTree(relPath, 1) : undefined;

    return {
      name,
      path: fullPath,
      relativePath: relPath.replace(/\\/g, '/'),
      type: isDir ? 'directory' : 'file',
      icon,
      size: isDir ? 0 : stat.size,
      mediaType,
      children,
      loaded: true,
      modified: stat.mtime.toISOString(),
    };
  }

  /**
   * Lazy load children for a given directory node
   */
  async loadChildren(node: FileNode): Promise<FileNode> {
    if (node.type === 'directory') {
      node.children = await fileService.getFileTree(node.relativePath, 1);
      node.loaded = true;
    }
    return node;
  }
}

export const treeService = new TreeService();
export default treeService;
