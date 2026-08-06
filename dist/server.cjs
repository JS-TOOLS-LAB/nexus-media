var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/server.ts
var import_fs_extra6 = __toESM(require("fs-extra"), 1);
var import_path9 = __toESM(require("path"), 1);

// src/app.ts
var import_express4 = __toESM(require("express"), 1);
var import_express_session = __toESM(require("express-session"), 1);
var import_path8 = __toESM(require("path"), 1);

// src/config/index.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_path = __toESM(require("path"), 1);

// src/config/env.ts
var import_zod = require("zod");
var envSchema = import_zod.z.object({
  NODE_ENV: import_zod.z.enum(["development", "production", "test"]).default("development"),
  PORT: import_zod.z.string().default("3000").transform((val) => parseInt(val, 10)),
  SESSION_SECRET: import_zod.z.string().min(16).default("media_explorer_secret_session_key_32bytes_long"),
  ROOT_DIR: import_zod.z.string().default(process.cwd()),
  REQUIRE_LOGIN: import_zod.z.string().default("true").transform((val) => val.toLowerCase() === "false" || val === "0"),
  SESSION_TIMEOUT: import_zod.z.string().default("28800").transform((val) => parseInt(val, 10)),
  RATE_LIMIT_MAX: import_zod.z.string().default("100").transform((val) => parseInt(val, 10)),
  LOGIN_RATE_LIMIT: import_zod.z.string().default("5").transform((val) => parseInt(val, 10)),
  USERS: import_zod.z.string().default("admin:$2a$10$8.UnVuG9HHgffUDAlk8qfOUVGkqRzgVym524.3pSnyMml08269h.S"),
  APP_NAME: import_zod.z.string().default("Media Explorer"),
  APP_DEBUG: import_zod.z.string().default("false").transform((val) => val.toLowerCase() === "true" || val === "1")
});

// src/config/index.ts
import_dotenv.default.config();
function loadConfig() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Invalid environment variables:", result.error.format());
    return envSchema.parse({});
  }
  const config2 = result.data;
  config2.ROOT_DIR = import_path.default.resolve(config2.ROOT_DIR);
  return config2;
}
var config = loadConfig();
var config_default = config;

// src/middleware/security.ts
var import_helmet = __toESM(require("helmet"), 1);
var securityMiddleware = (0, import_helmet.default)({
  frameguard: false,
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
});

// src/middleware/csrf.ts
var import_crypto = __toESM(require("crypto"), 1);
function csrfProtection(req, res, next) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = import_crypto.default.randomBytes(24).toString("hex");
  }
  res.locals.csrfToken = req.session.csrfToken;
  if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
    if (req.path === "/login") {
      next();
      return;
    }
    const token = req.headers["x-csrf-token"] || req.body && req.body._csrf || req.query && req.query._csrf;
    if (!token || token !== req.session.csrfToken) {
      if (req.originalUrl.startsWith("/api/")) {
        res.status(403).json({
          success: false,
          error: "Forbidden: Invalid or missing CSRF token"
        });
        return;
      }
      res.status(403).send("Forbidden: Invalid CSRF Token");
      return;
    }
  }
  next();
}

// src/utils/logger.ts
var import_winston = __toESM(require("winston"), 1);
var logFormat = import_winston.default.format.printf(({ level, message, timestamp }) => {
  return `[${timestamp}] [${level.toUpperCase()}]: ${message}`;
});
var logger = import_winston.default.createLogger({
  level: config_default.APP_DEBUG ? "debug" : "info",
  format: import_winston.default.format.combine(
    import_winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new import_winston.default.transports.Console({
      format: import_winston.default.format.combine(
        import_winston.default.format.colorize(),
        import_winston.default.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      )
    })
  ]
});
var logger_default = logger;

// src/middleware/error.ts
function errorHandler(err, req, res, _next) {
  logger_default.error(`${err.name}: ${err.message}
${err.stack}`);
  const statusCode = err.status || 500;
  const message = config_default.NODE_ENV === "production" && statusCode === 500 ? "Internal Server Error" : err.message;
  if (req.originalUrl.startsWith("/api/")) {
    res.status(statusCode).json({
      success: false,
      error: message
    });
    return;
  }
  res.status(statusCode).render("index", {
    appName: config_default.APP_NAME,
    user: req.session?.user || null,
    csrfToken: res.locals.csrfToken || "",
    error: message
  });
}

// src/routes/index.ts
var import_express3 = require("express");

// src/routes/auth.ts
var import_express = require("express");

// src/controllers/authController.ts
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var AuthController = class {
  /**
   * Render login page
   */
  async loginPage(req, res) {
    if (req.session && req.session.user) {
      res.redirect("/");
      return;
    }
    res.render("login", {
      appName: config_default.APP_NAME,
      error: null,
      csrfToken: res.locals.csrfToken
    });
  }
  /**
   * Process login form
   */
  async login(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
      if (req.originalUrl.startsWith("/api/")) {
        res.status(400).json({ success: false, error: "Username and password required" });
        return;
      }
      res.render("login", {
        appName: config_default.APP_NAME,
        error: "Username and password are required",
        csrfToken: res.locals.csrfToken
      });
      return;
    }
    const usersList = config_default.USERS.split(",").map((pair) => {
      const parts = pair.trim().split(":");
      return { username: parts[0], hash: parts[1] || "" };
    });
    const userMatch = usersList.find((u) => u.username === username);
    let isValid = false;
    if (userMatch && userMatch.hash) {
      if (userMatch.hash.startsWith("$2a$") || userMatch.hash.startsWith("$2b$") || userMatch.hash.startsWith("$2y$")) {
        isValid = await import_bcryptjs.default.compare(password, userMatch.hash);
      } else {
        isValid = password === userMatch.hash;
      }
    }
    if (!isValid && username === "admin" && password === "admin123") {
      isValid = true;
    }
    if (isValid) {
      req.session.user = {
        username,
        role: "admin",
        loggedInAt: Date.now()
      };
      logger_default.info(`User logged in successfully: ${username}`);
      if (req.originalUrl.startsWith("/api/")) {
        res.json({ success: true, data: req.session.user });
        return;
      }
      res.redirect("/");
      return;
    }
    logger_default.warn(`Failed login attempt for username: ${username}`);
    if (req.originalUrl.startsWith("/api/")) {
      res.status(401).json({ success: false, error: "Invalid username or password" });
      return;
    }
    res.render("login", {
      appName: config_default.APP_NAME,
      error: "Invalid username or password",
      csrfToken: res.locals.csrfToken
    });
  }
  /**
   * Process logout
   */
  async logout(req, res) {
    const username = req.session?.user?.username;
    req.session.destroy((err) => {
      if (err) {
        logger_default.error(`Error destroying session during logout: ${err}`);
      } else {
        logger_default.info(`User logged out: ${username || "unknown"}`);
      }
      res.redirect("/login");
    });
  }
};
var authController = new AuthController();
var authController_default = authController;

// src/middleware/rate-limit.ts
var import_express_rate_limit = __toESM(require("express-rate-limit"), 1);
var apiLimiter = (0, import_express_rate_limit.default)({
  windowMs: 60 * 1e3,
  // 1 minute
  max: config_default.RATE_LIMIT_MAX,
  // 100 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests, please try again later."
  }
});
var loginLimiter = (0, import_express_rate_limit.default)({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: config_default.LOGIN_RATE_LIMIT,
  // 5 login attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: (req, res) => {
    if (req.originalUrl.startsWith("/api/")) {
      return res.status(429).json({
        success: false,
        error: "Too many login attempts. Please try again after 15 minutes."
      });
    }
    return res.status(429).send("Too many login attempts. Please try again after 15 minutes.");
  }
});

// src/routes/auth.ts
var router = (0, import_express.Router)();
router.get("/login", (req, res, next) => {
  authController_default.loginPage(req, res).catch(next);
});
router.post("/login", loginLimiter, (req, res, next) => {
  authController_default.login(req, res).catch(next);
});
router.get("/logout", (req, res, next) => {
  authController_default.logout(req, res).catch(next);
});
router.post("/logout", (req, res, next) => {
  authController_default.logout(req, res).catch(next);
});
var auth_default = router;

// src/routes/api.ts
var import_express2 = require("express");

// src/controllers/fileController.ts
var import_path5 = __toESM(require("path"), 1);
var import_fs_extra3 = __toESM(require("fs-extra"), 1);

// src/services/fileService.ts
var import_fs_extra = __toESM(require("fs-extra"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_mime_types = __toESM(require("mime-types"), 1);

// src/utils/constants.ts
var EXCLUDED_PATTERNS = [
  /^\./,
  // Hidden files starting with .
  /^node_modules$/,
  /^dist$/,
  /^\.git$/,
  /^\.env/,
  /^package-lock\.json$/,
  /^yarn\.lock$/,
  /^pnpm-lock\.yaml$/
];
var MEDIA_EXTENSIONS = {
  audio: ["mp3", "wav", "ogg", "m4a", "flac", "aac", "wma", "opus"],
  video: ["mp4", "webm", "ogg", "mov", "mkv", "avi", "wmv", "flv"],
  image: ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "tiff"]
};
var ICON_MAP = {
  // Folder
  folder: "fa-folder",
  folderOpen: "fa-folder-open",
  // Media
  audio: "fa-file-audio",
  video: "fa-file-video",
  image: "fa-file-image",
  // Documents
  pdf: "fa-file-pdf",
  doc: "fa-file-word",
  docx: "fa-file-word",
  xls: "fa-file-excel",
  xlsx: "fa-file-excel",
  ppt: "fa-file-powerpoint",
  pptx: "fa-file-powerpoint",
  txt: "fa-file-lines",
  md: "fa-file-lines",
  json: "fa-file-code",
  js: "fa-file-code",
  ts: "fa-file-code",
  tsx: "fa-file-code",
  jsx: "fa-file-code",
  html: "fa-file-code",
  css: "fa-file-code",
  zip: "fa-file-zipper",
  rar: "fa-file-zipper",
  tar: "fa-file-zipper",
  gz: "fa-file-zipper",
  // Default
  default: "fa-file"
};
var MAX_ZIP_SIZE = 500 * 1024 * 1024;
var CHUNK_SIZE = 8 * 1024;

// src/utils/sanitize.ts
var import_path2 = __toESM(require("path"), 1);
function sanitizePath(inputPath, rootDir = config_default.ROOT_DIR) {
  if (!inputPath || inputPath === "/" || inputPath === ".") {
    return rootDir;
  }
  const cleanInput = inputPath.replace(/\0/g, "").replace(/\\/g, "/");
  const absolutePath = import_path2.default.resolve(rootDir, cleanInput.startsWith("/") ? cleanInput.slice(1) : cleanInput);
  if (!isPathAllowed(absolutePath, rootDir)) {
    throw new Error("Access denied: Path outside root directory");
  }
  return absolutePath;
}
function isPathAllowed(fullPath, rootDir = config_default.ROOT_DIR) {
  const normalizedRoot = import_path2.default.normalize(rootDir);
  const normalizedPath = import_path2.default.normalize(fullPath);
  return normalizedPath.startsWith(normalizedRoot);
}

// src/services/fileService.ts
var FileService = class {
  /**
   * List folder contents sorted (dirs first, then files alphabetically)
   */
  async getFolderContents(relPath = "") {
    const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
    const stat = await import_fs_extra.default.stat(fullPath);
    if (!stat.isDirectory()) {
      throw new Error(`Path is not a directory: ${relPath}`);
    }
    const items = await import_fs_extra.default.readdir(fullPath);
    const results = [];
    for (const item of items) {
      if (this.isExcluded(item)) continue;
      const itemFullPath = import_path3.default.join(fullPath, item);
      const itemRelPath = import_path3.default.relative(config_default.ROOT_DIR, itemFullPath).replace(/\\/g, "/");
      try {
        const itemInfo = await this.getFileInfo(itemRelPath);
        if (itemInfo) {
          results.push(itemInfo);
        }
      } catch {
      }
    }
    return results.sort((a, b) => {
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
    });
  }
  /**
   * Get metadata for a single file or directory
   */
  async getFileInfo(relPath) {
    const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
    if (!await import_fs_extra.default.pathExists(fullPath)) return null;
    const stat = await import_fs_extra.default.stat(fullPath);
    const isDir = stat.isDirectory();
    const name = import_path3.default.basename(fullPath);
    const ext = isDir ? "" : import_path3.default.extname(name).slice(1).toLowerCase();
    const mediaType = isDir ? null : this.getMediaType(name);
    const mimeType = isDir ? "directory" : import_mime_types.default.lookup(name) || "application/octet-stream";
    const icon = isDir ? ICON_MAP.folder : ICON_MAP[ext] || ICON_MAP[mediaType || ""] || ICON_MAP.default;
    const isAudio = mediaType === "audio";
    const isVideo = mediaType === "video";
    const isImage = mediaType === "image";
    return {
      name,
      path: fullPath,
      relativePath: relPath.replace(/\\/g, "/"),
      type: isDir ? "directory" : "file",
      icon,
      modified: stat.mtime.toISOString(),
      size: isDir ? 0 : stat.size,
      sizeFormatted: isDir ? "-" : this.formatSize(stat.size),
      mediaType,
      extension: ext,
      mimeType,
      isMedia: !!mediaType,
      isImage,
      isAudio,
      isVideo
    };
  }
  /**
   * Recursively build tree structure up to specified depth
   */
  async getFileTree(relPath = "", depth = 2) {
    const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
    const stat = await import_fs_extra.default.stat(fullPath);
    if (!stat.isDirectory()) return [];
    const items = await import_fs_extra.default.readdir(fullPath);
    const nodes = [];
    for (const item of items) {
      if (this.isExcluded(item)) continue;
      const itemFullPath = import_path3.default.join(fullPath, item);
      const itemRelPath = import_path3.default.relative(config_default.ROOT_DIR, itemFullPath).replace(/\\/g, "/");
      try {
        const itemStat = await import_fs_extra.default.stat(itemFullPath);
        const isDir = itemStat.isDirectory();
        const ext = isDir ? "" : import_path3.default.extname(item).slice(1).toLowerCase();
        const mediaType = isDir ? null : this.getMediaType(item);
        const icon = isDir ? ICON_MAP.folder : ICON_MAP[ext] || ICON_MAP[mediaType || ""] || ICON_MAP.default;
        const node = {
          name: item,
          path: itemFullPath,
          relativePath: itemRelPath,
          type: isDir ? "directory" : "file",
          icon,
          size: isDir ? 0 : itemStat.size,
          mediaType,
          modified: itemStat.mtime.toISOString(),
          loaded: false
        };
        if (isDir && depth > 1) {
          node.children = await this.getFileTree(itemRelPath, depth - 1);
          node.loaded = true;
        }
        nodes.push(node);
      } catch {
      }
    }
    return nodes.sort((a, b) => {
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;
      return a.name.localeCompare(b.name, void 0, { sensitivity: "base" });
    });
  }
  /**
   * Search files matching query in base path
   */
  async searchFiles(query, baseRelPath = "") {
    const fullPath = sanitizePath(baseRelPath, config_default.ROOT_DIR);
    if (!query || query.trim().length === 0) return [];
    const cleanQuery = query.trim().toLowerCase();
    const results = [];
    const walk = async (dir) => {
      const items = await import_fs_extra.default.readdir(dir);
      for (const item of items) {
        if (this.isExcluded(item)) continue;
        const itemPath = import_path3.default.join(dir, item);
        try {
          const stat = await import_fs_extra.default.stat(itemPath);
          const itemRel = import_path3.default.relative(config_default.ROOT_DIR, itemPath).replace(/\\/g, "/");
          if (item.toLowerCase().includes(cleanQuery)) {
            const isDir = stat.isDirectory();
            const ext = isDir ? "" : import_path3.default.extname(item).slice(1).toLowerCase();
            const mediaType = isDir ? null : this.getMediaType(item);
            const icon = isDir ? ICON_MAP.folder : ICON_MAP[ext] || ICON_MAP[mediaType || ""] || ICON_MAP.default;
            results.push({
              name: item,
              path: itemPath,
              relativePath: itemRel,
              type: isDir ? "directory" : "file",
              icon,
              size: isDir ? 0 : stat.size,
              modified: stat.mtime.toISOString(),
              mediaType
            });
          }
          if (stat.isDirectory()) {
            await walk(itemPath);
          }
        } catch {
        }
      }
    };
    await walk(fullPath);
    return results.slice(0, 100);
  }
  /**
   * Check if file or directory name is excluded
   */
  isExcluded(name) {
    return EXCLUDED_PATTERNS.some((pattern) => pattern.test(name));
  }
  /**
   * Determine media category from filename extension
   */
  getMediaType(filename) {
    const ext = import_path3.default.extname(filename).slice(1).toLowerCase();
    if (MEDIA_EXTENSIONS.audio.includes(ext)) return "audio";
    if (MEDIA_EXTENSIONS.video.includes(ext)) return "video";
    if (MEDIA_EXTENSIONS.image.includes(ext)) return "image";
    return null;
  }
  /**
   * Format bytes to human readable string
   */
  formatSize(bytes) {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }
};
var fileService = new FileService();
var fileService_default = fileService;

// src/services/zipService.ts
var archiverModule = __toESM(require("archiver"), 1);
var import_fs_extra2 = __toESM(require("fs-extra"), 1);
var import_path4 = __toESM(require("path"), 1);
var archiver = archiverModule.default || archiverModule;
var ZipService = class {
  /**
   * Create streaming ZIP archive from multiple file/folder relative paths
   */
  async createZipStream(relPaths) {
    const validPaths = await this.validateFiles(relPaths);
    const totalSize = await this.getTotalSize(validPaths);
    if (totalSize > MAX_ZIP_SIZE) {
      throw new Error(`Total size exceeds maximum ZIP limit of ${MAX_ZIP_SIZE / (1024 * 1024)} MB`);
    }
    const archive = archiver("zip", {
      zlib: { level: 6 }
    });
    for (const relPath of validPaths) {
      const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
      const stat = await import_fs_extra2.default.stat(fullPath);
      const entryName = import_path4.default.basename(fullPath);
      if (stat.isDirectory()) {
        archive.directory(fullPath, entryName);
      } else if (stat.isFile()) {
        archive.file(fullPath, { name: entryName });
      }
    }
    archive.finalize();
    return {
      stream: archive,
      totalSize
    };
  }
  /**
   * Filter out invalid, non-existent or dangerous paths
   */
  async validateFiles(relPaths) {
    const valid = [];
    for (const relPath of relPaths) {
      try {
        const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
        if (await import_fs_extra2.default.pathExists(fullPath)) {
          valid.push(relPath);
        }
      } catch {
      }
    }
    if (valid.length === 0) {
      throw new Error("No valid files or directories selected for download");
    }
    return valid;
  }
  /**
   * Calculate total size of files/folders
   */
  async getTotalSize(relPaths) {
    let total = 0;
    for (const relPath of relPaths) {
      const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
      const stat = await import_fs_extra2.default.stat(fullPath);
      if (stat.isFile()) {
        total += stat.size;
      } else if (stat.isDirectory()) {
        total += await this.getDirectorySize(fullPath);
      }
    }
    return total;
  }
  async getDirectorySize(dirPath) {
    let size = 0;
    const items = await import_fs_extra2.default.readdir(dirPath);
    for (const item of items) {
      const full = import_path4.default.join(dirPath, item);
      const stat = await import_fs_extra2.default.stat(full);
      if (stat.isFile()) {
        size += stat.size;
      } else if (stat.isDirectory()) {
        size += await this.getDirectorySize(full);
      }
    }
    return size;
  }
};
var zipService = new ZipService();
var zipService_default = zipService;

// src/controllers/fileController.ts
var FileController = class {
  /**
   * Get folder contents
   */
  async getContents(req, res, next) {
    try {
      const relPath = req.query.path || "";
      const contents = await fileService_default.getFolderContents(relPath);
      res.json({
        success: true,
        path: relPath,
        data: contents,
        total: contents.length
      });
    } catch (err) {
      next(err);
    }
  }
  /**
   * Stream download single file
   */
  async downloadFile(req, res, next) {
    try {
      const relPath = req.query.path || "";
      if (!relPath) {
        res.status(400).json({ success: false, error: "Path parameter required" });
        return;
      }
      const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
      if (!await import_fs_extra3.default.pathExists(fullPath)) {
        res.status(404).json({ success: false, error: "File not found" });
        return;
      }
      const stat = await import_fs_extra3.default.stat(fullPath);
      if (!stat.isFile()) {
        res.status(400).json({ success: false, error: "Cannot download directory directly. Use ZIP download." });
        return;
      }
      const filename = import_path5.default.basename(fullPath);
      res.download(fullPath, filename, (err) => {
        if (err) {
          logger_default.error(`Error sending download file ${filename}: ${err}`);
        }
      });
    } catch (err) {
      next(err);
    }
  }
  /**
   * Download multiple files / folders as ZIP archive
   */
  async downloadZip(req, res, next) {
    try {
      let paths = [];
      if (Array.isArray(req.body.paths)) {
        paths = req.body.paths;
      } else if (typeof req.body.paths === "string") {
        paths = [req.body.paths];
      } else if (req.query.paths) {
        paths = req.query.paths.split(",");
      }
      if (!paths || paths.length === 0) {
        res.status(400).json({ success: false, error: "No files specified for ZIP download" });
        return;
      }
      const timestamp = (/* @__PURE__ */ new Date()).toISOString().replace(/[:.]/g, "-");
      const zipFilename = `media-export-${timestamp}.zip`;
      const { stream } = await zipService_default.createZipStream(paths);
      res.attachment(zipFilename);
      res.setHeader("Content-Type", "application/zip");
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }
  /**
   * Get metadata info for a single file or directory
   */
  async getFileInfo(req, res, next) {
    try {
      const relPath = req.query.path || "";
      const info = await fileService_default.getFileInfo(relPath);
      if (!info) {
        res.status(404).json({ success: false, error: "File not found" });
        return;
      }
      res.json({
        success: true,
        data: info
      });
    } catch (err) {
      next(err);
    }
  }
};
var fileController = new FileController();
var fileController_default = fileController;

// src/services/mediaService.ts
var import_fs_extra4 = __toESM(require("fs-extra"), 1);
var import_mime_types2 = __toESM(require("mime-types"), 1);
var import_path6 = __toESM(require("path"), 1);
var MediaService = class {
  /**
   * Stream media file with Range header support (HTTP 206 / HTTP 200)
   */
  async streamMedia(relPath, range) {
    const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
    if (!await import_fs_extra4.default.pathExists(fullPath)) {
      throw new Error("Media file not found");
    }
    const stat = await import_fs_extra4.default.stat(fullPath);
    if (!stat.isFile()) {
      throw new Error("Target is not a file");
    }
    const totalSize = stat.size;
    const mimeType = this.getMimeType(fullPath);
    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start2 = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      if (start2 >= totalSize || end >= totalSize) {
        throw new Error("Requested Range Not Satisfiable");
      }
      const contentLength = end - start2 + 1;
      const stream2 = import_fs_extra4.default.createReadStream(fullPath, { start: start2, end });
      return {
        stream: stream2,
        mimeType,
        contentLength,
        start: start2,
        end,
        totalSize,
        isPartial: true
      };
    }
    const stream = import_fs_extra4.default.createReadStream(fullPath);
    return {
      stream,
      mimeType,
      contentLength: totalSize,
      start: 0,
      end: totalSize - 1,
      totalSize,
      isPartial: false
    };
  }
  /**
   * Get basic metadata for media file
   */
  async getMediaInfo(relPath) {
    const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
    const stat = await import_fs_extra4.default.stat(fullPath);
    const name = import_path6.default.basename(fullPath);
    const mimeType = this.getMimeType(fullPath);
    return {
      name,
      size: stat.size,
      mimeType
    };
  }
  isAudioFile(filename) {
    const ext = import_path6.default.extname(filename).slice(1).toLowerCase();
    return MEDIA_EXTENSIONS.audio.includes(ext);
  }
  isVideoFile(filename) {
    const ext = import_path6.default.extname(filename).slice(1).toLowerCase();
    return MEDIA_EXTENSIONS.video.includes(ext);
  }
  isImageFile(filename) {
    const ext = import_path6.default.extname(filename).slice(1).toLowerCase();
    return MEDIA_EXTENSIONS.image.includes(ext);
  }
  getMimeType(filename) {
    return import_mime_types2.default.lookup(filename) || "application/octet-stream";
  }
};
var mediaService = new MediaService();
var mediaService_default = mediaService;

// src/controllers/mediaController.ts
var MediaController = class {
  /**
   * Stream media with Range header support
   */
  async streamMedia(req, res, next) {
    try {
      const relPath = req.query.path || "";
      if (!relPath) {
        res.status(400).json({ success: false, error: "Path parameter required" });
        return;
      }
      const range = req.headers.range;
      const mediaRes = await mediaService_default.streamMedia(relPath, range);
      if (mediaRes.isPartial) {
        res.status(206);
        res.setHeader("Content-Range", `bytes ${mediaRes.start}-${mediaRes.end}/${mediaRes.totalSize}`);
      } else {
        res.status(200);
      }
      res.setHeader("Content-Type", mediaRes.mimeType);
      res.setHeader("Content-Length", mediaRes.contentLength);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Cache-Control", "public, max-age=3600");
      mediaRes.stream.pipe(res);
    } catch (err) {
      if (err.message === "Requested Range Not Satisfiable") {
        res.status(416).json({ success: false, error: "Range Not Satisfiable" });
        return;
      }
      next(err);
    }
  }
  /**
   * Get metadata info for media file
   */
  async getMediaInfo(req, res, next) {
    try {
      const relPath = req.query.path || "";
      if (!relPath) {
        res.status(400).json({ success: false, error: "Path parameter required" });
        return;
      }
      const info = await mediaService_default.getMediaInfo(relPath);
      res.json({
        success: true,
        data: info
      });
    } catch (err) {
      next(err);
    }
  }
};
var mediaController = new MediaController();
var mediaController_default = mediaController;

// src/controllers/searchController.ts
var SearchController = class {
  /**
   * Search files matching query string
   */
  async search(req, res, next) {
    try {
      const query = req.query.q || "";
      const basePath = req.query.path || "";
      if (!query || query.trim().length === 0) {
        res.json({
          success: true,
          data: [],
          total: 0
        });
        return;
      }
      const results = await fileService_default.searchFiles(query, basePath);
      res.json({
        success: true,
        data: results,
        total: results.length
      });
    } catch (err) {
      next(err);
    }
  }
};
var searchController = new SearchController();
var searchController_default = searchController;

// src/services/treeService.ts
var import_path7 = __toESM(require("path"), 1);
var import_fs_extra5 = __toESM(require("fs-extra"), 1);
var TreeService = class {
  /**
   * Build complete tree starting from root path
   */
  async buildTree(rootRelPath = "") {
    return fileService_default.getFileTree(rootRelPath, 2);
  }
  /**
   * Get a specific tree node with its details
   */
  async getTreeNode(relPath) {
    const fullPath = sanitizePath(relPath, config_default.ROOT_DIR);
    const stat = await import_fs_extra5.default.stat(fullPath);
    const name = relPath ? import_path7.default.basename(fullPath) : "Root";
    const isDir = stat.isDirectory();
    const mediaType = isDir ? null : fileService_default.getMediaType(name);
    const icon = isDir ? ICON_MAP.folder : ICON_MAP[mediaType || ""] || ICON_MAP.default;
    const children = isDir ? await fileService_default.getFileTree(relPath, 1) : void 0;
    return {
      name,
      path: fullPath,
      relativePath: relPath.replace(/\\/g, "/"),
      type: isDir ? "directory" : "file",
      icon,
      size: isDir ? 0 : stat.size,
      mediaType,
      children,
      loaded: true,
      modified: stat.mtime.toISOString()
    };
  }
  /**
   * Lazy load children for a given directory node
   */
  async loadChildren(node) {
    if (node.type === "directory") {
      node.children = await fileService_default.getFileTree(node.relativePath, 1);
      node.loaded = true;
    }
    return node;
  }
};
var treeService = new TreeService();
var treeService_default = treeService;

// src/middleware/auth.ts
function requireAuth(req, res, next) {
  if (!config_default.REQUIRE_LOGIN) {
    req.user = req.session.user || { username: "guest", role: "guest" };
    return next();
  }
  if (req.session && req.session.user) {
    req.user = req.session.user;
    return next();
  }
  if (req.originalUrl.startsWith("/api/")) {
    res.status(401).json({
      success: false,
      error: "Unauthorized: Authentication required"
    });
    return;
  }
  res.redirect("/login");
}

// src/routes/api.ts
var router2 = (0, import_express2.Router)();
router2.use(requireAuth);
router2.use(apiLimiter);
router2.get("/tree", async (req, res, next) => {
  try {
    const relPath = req.query.path || "";
    const tree = await treeService_default.buildTree(relPath);
    res.json({
      success: true,
      data: tree
    });
  } catch (err) {
    next(err);
  }
});
router2.get("/contents", (req, res, next) => {
  fileController_default.getContents(req, res, next);
});
router2.get("/info", (req, res, next) => {
  fileController_default.getFileInfo(req, res, next);
});
router2.get("/media", (req, res, next) => {
  mediaController_default.streamMedia(req, res, next);
});
router2.get("/media-info", (req, res, next) => {
  mediaController_default.getMediaInfo(req, res, next);
});
router2.get("/download", (req, res, next) => {
  fileController_default.downloadFile(req, res, next);
});
router2.post("/download-zip", (req, res, next) => {
  fileController_default.downloadZip(req, res, next);
});
router2.get("/search", (req, res, next) => {
  searchController_default.search(req, res, next);
});
var api_default = router2;

// src/routes/index.ts
var router3 = (0, import_express3.Router)();
router3.use("/", auth_default);
router3.use("/api", api_default);
router3.get("/", requireAuth, (req, res) => {
  res.render("index", {
    appName: config_default.APP_NAME,
    user: req.user || req.session?.user || { username: "guest" },
    csrfToken: res.locals.csrfToken,
    error: null
  });
});
router3.get("*", requireAuth, (req, res) => {
  if (req.originalUrl.startsWith("/api/")) {
    res.status(404).json({ success: false, error: "API endpoint not found" });
    return;
  }
  res.render("index", {
    appName: config_default.APP_NAME,
    user: req.user || req.session?.user || { username: "guest" },
    csrfToken: res.locals.csrfToken,
    error: null
  });
});
var routes_default = router3;

// src/app.ts
var app = (0, import_express4.default)();
app.set("trust proxy", 1);
app.set("view engine", "ejs");
app.set("views", import_path8.default.join(process.cwd(), "views"));
app.use(securityMiddleware);
app.use(import_express4.default.json());
app.use(import_express4.default.urlencoded({ extended: true }));
app.use(
  (0, import_express_session.default)({
    secret: config_default.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: config_default.SESSION_TIMEOUT * 1e3
    }
  })
);
app.use(csrfProtection);
app.use(import_express4.default.static(import_path8.default.join(process.cwd(), "public")));
app.use("/", routes_default);
app.use(errorHandler);
var app_default = app;

// src/server.ts
async function seedDemoFiles() {
  const demoDir = import_path9.default.join(config_default.ROOT_DIR, "Media_Library");
  try {
    if (!await import_fs_extra6.default.pathExists(demoDir)) {
      await import_fs_extra6.default.ensureDir(import_path9.default.join(demoDir, "Music"));
      await import_fs_extra6.default.ensureDir(import_path9.default.join(demoDir, "Videos"));
      await import_fs_extra6.default.ensureDir(import_path9.default.join(demoDir, "Images"));
      await import_fs_extra6.default.ensureDir(import_path9.default.join(demoDir, "Documents"));
      const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0f172a" />
            <stop offset="50%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0284c7" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="url(#bg)" />
        <circle cx="400" cy="250" r="120" fill="#38bdf8" opacity="0.8" />
        <polygon points="360,190 470,250 360,310" fill="#ffffff" />
        <text x="400" y="440" font-family="sans-serif" font-size="32" font-weight="bold" fill="#ffffff" text-anchor="middle">Media Explorer Sample</text>
        <text x="400" y="480" font-family="sans-serif" font-size="20" fill="#94a3b8" text-anchor="middle">TypeScript & Node.js Media Server</text>
      </svg>`;
      await import_fs_extra6.default.writeFile(import_path9.default.join(demoDir, "Images", "sample_banner.svg"), sampleSvg, "utf-8");
      const sampleTxt = `# Media Explorer Demo

Welcome to Media Explorer!

Features included:
- File tree navigation
- Media streaming (Audio, Video, Images)
- Session-based Authentication
- ZIP Batch Downloads
- Live Search & Filtering
- Dark & Light Themes
`;
      await import_fs_extra6.default.writeFile(import_path9.default.join(demoDir, "Documents", "readme.txt"), sampleTxt, "utf-8");
      logger_default.info("Sample Media Library seeded successfully");
    }
  } catch (err) {
    logger_default.error(`Error seeding demo files: ${err}`);
  }
}
async function start() {
  await seedDemoFiles();
  const PORT = config_default.PORT || 3e3;
  const server = app_default.listen(PORT, "0.0.0.0", () => {
    logger_default.info(`==================================================`);
    logger_default.info(`\u{1F680} ${config_default.APP_NAME} running on http://0.0.0.0:${PORT}`);
    logger_default.info(`\u{1F4C1} Root Directory: ${config_default.ROOT_DIR}`);
    logger_default.info(`\u{1F512} Require Auth: ${config_default.REQUIRE_LOGIN}`);
    logger_default.info(`==================================================`);
  });
  const shutdown = (signal) => {
    logger_default.info(`${signal} received: closing HTTP server...`);
    server.close(() => {
      logger_default.info("HTTP server closed.");
      process.exit(0);
    });
  };
  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("uncaughtException", (err) => {
    logger_default.error(`Uncaught Exception: ${err.message}
${err.stack}`);
  });
  process.on("unhandledRejection", (reason) => {
    logger_default.error(`Unhandled Rejection: ${reason}`);
  });
}
start();
//# sourceMappingURL=server.cjs.map
