// src/utils/sanitize.ts
import path from 'path';
import config from '../config';

/**
 * Ensures input path stays within ROOT_DIR and prevents path traversal attacks.
 */
export function sanitizePath(inputPath: string, rootDir: string = config.ROOT_DIR): string {
  if (!inputPath || inputPath === '/' || inputPath === '.') {
    return rootDir;
  }

  // Remove leading slashes and null bytes
  const cleanInput = inputPath.replace(/\0/g, '').replace(/\\/g, '/');
  
  // Resolve absolute target path
  const absolutePath = path.resolve(rootDir, cleanInput.startsWith('/') ? cleanInput.slice(1) : cleanInput);

  // Verify path is within root directory
  if (!isPathAllowed(absolutePath, rootDir)) {
    throw new Error('Access denied: Path outside root directory');
  }

  return absolutePath;
}

/**
 * Check if path is within allowed root directory
 */
export function isPathAllowed(fullPath: string, rootDir: string = config.ROOT_DIR): boolean {
  const normalizedRoot = path.normalize(rootDir);
  const normalizedPath = path.normalize(fullPath);
  return normalizedPath.startsWith(normalizedRoot);
}

/**
 * Remove dangerous characters from filenames
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/\0/g, '')
    .replace(/[/\\]/g, '_')
    .replace(/\.\.+/g, '.')
    .trim();
}
