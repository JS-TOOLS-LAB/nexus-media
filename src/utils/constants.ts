// src/utils/constants.ts

export const EXCLUDED_PATTERNS = [
  /^\./, // Hidden files starting with .
  /^node_modules$/,
  /^dist$/,
  /^\.git$/,
  /^\.env/,
  /^package-lock\.json$/,
  /^yarn\.lock$/,
  /^pnpm-lock\.yaml$/,
];

export const MEDIA_EXTENSIONS = {
  audio: ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus'],
  video: ['mp4', 'webm', 'ogg', 'mov', 'mkv', 'avi', 'wmv', 'flv'],
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'],
};

export const ICON_MAP: Record<string, string> = {
  // Folder
  folder: 'fa-folder',
  folderOpen: 'fa-folder-open',
  
  // Media
  audio: 'fa-file-audio',
  video: 'fa-file-video',
  image: 'fa-file-image',

  // Documents
  pdf: 'fa-file-pdf',
  doc: 'fa-file-word',
  docx: 'fa-file-word',
  xls: 'fa-file-excel',
  xlsx: 'fa-file-excel',
  ppt: 'fa-file-powerpoint',
  pptx: 'fa-file-powerpoint',
  txt: 'fa-file-lines',
  md: 'fa-file-lines',
  json: 'fa-file-code',
  js: 'fa-file-code',
  ts: 'fa-file-code',
  tsx: 'fa-file-code',
  jsx: 'fa-file-code',
  html: 'fa-file-code',
  css: 'fa-file-code',
  zip: 'fa-file-zipper',
  rar: 'fa-file-zipper',
  tar: 'fa-file-zipper',
  gz: 'fa-file-zipper',

  // Default
  default: 'fa-file',
};

export const MAX_ZIP_SIZE = 500 * 1024 * 1024; // 500 MB
export const CHUNK_SIZE = 8 * 1024; // 8KB
