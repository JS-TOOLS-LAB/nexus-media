// src/types/index.ts

export type MediaType = 'audio' | 'video' | 'image' | null;

export interface FileNode {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  icon: string;
  size: number;
  mediaType: MediaType;
  children?: FileNode[];
  loaded?: boolean;
  modified: string;
}

export interface FileInfo {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  icon: string;
  modified: string;
  size: number;
  sizeFormatted: string;
  mediaType: MediaType;
  extension: string;
  mimeType: string;
  isMedia: boolean;
  isImage: boolean;
  isAudio: boolean;
  isVideo: boolean;
}

export interface SearchResult {
  name: string;
  path: string;
  relativePath: string;
  type: 'file' | 'directory';
  icon: string;
  size: number;
  modified: string;
  mediaType: MediaType;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  path?: string;
  cached?: boolean;
  total?: number;
}

export interface MediaStreamResponse {
  stream: import('fs').ReadStream;
  mimeType: string;
  contentLength: number;
  start: number;
  end: number;
  totalSize: number;
  isPartial: boolean;
}

export interface MediaInfo {
  name: string;
  size: number;
  mimeType: string;
  duration?: number;
  codec?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface SessionUser {
  username: string;
  role?: string;
  loggedInAt?: number;
}

export interface AppConfig {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  SESSION_SECRET: string;
  ROOT_DIR: string;
  REQUIRE_LOGIN: boolean;
  SESSION_TIMEOUT: number;
  RATE_LIMIT_MAX: number;
  LOGIN_RATE_LIMIT: number;
  USERS: string;
  APP_NAME: string;
  APP_DEBUG: boolean;
}

declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
    csrfToken?: string;
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}
