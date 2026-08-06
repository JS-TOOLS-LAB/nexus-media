<div align="center">

  <h1>⚡ Nexus Media</h1>

  <p><strong>A modern, full-featured media file explorer with custom player, authentication, and file management. Built with TypeScript, Node.js, React, and Tailwind CSS.</strong></p>

  <p>
    <a href="https://github.com/JS-TOOLS-LAB/nexus-media"><img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
    <a href="https://github.com/JS-TOOLS-LAB/nexus-media"><img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" /></a>
    <a href="https://github.com/JS-TOOLS-LAB/nexus-media"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
    <a href="https://github.com/JS-TOOLS-LAB/nexus-media"><img src="https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" /></a>
    <a href="https://github.com/JS-TOOLS-LAB/nexus-media"><img src="https://img.shields.io/badge/Tailwind_CSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" /></a>
    <a href="https://github.com/JS-TOOLS-LAB/nexus-media"><img src="https://img.shields.io/badge/Vite-6.2-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" /></a>
    <a href="https://github.com/JS-TOOLS-LAB/nexus-media/blob/main/LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT" /></a>
    <a href="https://github.com/JS-TOOLS-LAB/nexus-media/pulls"><img src="https://img.shields.io/badge/PRs-Welcome-brightgreen.svg?style=for-the-badge" alt="PRs Welcome" /></a>
  </p>

  <br />

  <p align="center">
    <!-- Preview Screenshot Placeholders -->
    <img src="https://raw.githubusercontent.com/JS-TOOLS-LAB/nexus-media/main/assets/preview-dark.png" alt="Nexus Media Dark Mode Preview" width="800" />
  </p>

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🏗 Architecture](#-architecture)
- [🔒 Security](#-security)
- [📡 API Documentation](#-api-documentation)
- [🛠 Built With](#-built-with)
- [🧪 Testing](#-testing)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)
- [🙏 Acknowledgments](#-acknowledgments)
- [📊 Project Statistics](#-project-statistics)
- [💬 Contact \& Support](#-contact--support)

---

## ✨ Features

### 🎧 Media Playback
- **Custom Audio Player** – Full-featured custom player complete with dynamic progress bar, volume control, mute toggles, seek controls (±10s), and duration tracking.
- **Video Player** – Native HTML5 video player wrapped in custom glassmorphic overlay with full responsive viewport scaling.
- **Image Viewer** – High-resolution image modal complete with interactive zoom in/out controls and scale resets.
- **Seek & Streaming Support** – HTTP 206 Partial Content streaming support with Range headers for instant playback without downloading entire files.
- **Playback Queue** – Seamless transition and state preservation across media previews.

### 📂 File Management
- **File Tree Navigation** – Interactive, multi-level directory sidebar with lazy-loaded folder expansions.
- **Grid / List Views** – Flexible view mode toggle between grid cards with visual media thumbnails and structured list rows.
- **Bulk Selection** – Multi-file selection support via checkboxes for batch operations.
- **Real-Time Search & Filter** – Instant query-based file searching with debouncing across directory subtrees.
- **Breadcrumb Traversal** – Interactive breadcrumb path navigation bar for seamless directory traversal.

### 🛡 Security
- **Session Authentication** – Express session management backed by stateful authentication cookies and bcrypt password hashing.
- **CSRF Protection** – Token-based request validation (`x-csrf-token`) on state-changing API actions.
- **Rate Limiting** – Tiered rate limiting middleware enforcing 100 req/min for general API routes and 5 req/15min for authentication attempts.
- **Path Traversal Prevention** – Strict directory boundary checks preventing `../` path traversal attacks using path normalization.
- **Security Headers** – Hardened HTTP headers powered by Helmet.js to guard against XSS, clickjacking, and MIME sniffing.

### 🎨 User Experience
- **Dark / Light Theme** – Dual visual themes with instant state toggling and `localStorage` preference persistence.
- **Mobile Responsive** – Fully fluid, touch-friendly UI layout with collapsible sidebar drawers for mobile and tablet devices.
- **Keyboard Shortcuts** – Quick modal dismissal with `Esc` and keyboard accessibility.
- **Toast Notifications & Feedback** – Real-time error, warning, and success feedback toasts.
- **Loading & Empty States** – Animated spinners and context-aware empty state graphics for async file loads.

### 📦 Downloads
- **Single File Download** – One-click direct streaming downloads for individual media assets.
- **Batch ZIP Download** – On-the-fly zip archive generation for multiple selected files.
- **Streaming ZIP Archive** – High-performance memory-efficient streaming zip compression via Archiver.

---

## 🚀 Quick Start

### Prerequisites

| Tool | Required Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `18.0.0` or higher | Runtime Environment |
| **npm** / **bun** | Latest | Package Manager |
| **Git** | Latest | Source Control |

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JS-TOOLS-LAB/nexus-media.git
   cd nexus-media
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   ```bash
   cp .env.example .env
   ```

4. **Start Development Server:**
   ```bash
   npm run dev
   ```

   Navigate to `http://localhost:3000` in your web browser.

---

### Environment Variables

Configure your `.env` file using the following keys:

| Key | Default Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `PORT` | `3000` | Port for the Express server |
| `SESSION_SECRET` | `super-secret-key-change-in-production` | Secret string used to sign session cookies |
| `SESSION_TIMEOUT` | `3600000` | Session expiration time in milliseconds (1 hour) |
| `REQUIRE_LOGIN` | `true` | Enforce authentication check for API routes |
| `RATE_LIMIT_MAX` | `100` | Max API requests per window (per IP) |
| `LOGIN_RATE_LIMIT` | `5` | Max login attempts per 15-minute window |
| `ROOT_DIR` | `./Media_Library` | Target root directory path to serve media files from |
| `APP_NAME` | `Nexus Media` | Display title for the application |
| `APP_DEBUG` | `true` | Enable verbose system logging |
| `USERS` | `admin:$2a$10$...` | JSON or colon-formatted user credentials list |

> ⚠️ **SECURITY WARNING:** Change the default `SESSION_SECRET` and user credentials in `.env` immediately before deploying to any production environment!

---

### Default Credentials

Upon first launching the development environment, sign in with:

```text
Username: admin
Password: admin123
```

---

### Build for Production

To build and start the standalone production server:

```bash
# Compile client assets and bundle Express backend
npm run build

# Launch production node server
npm start
```

---

## 📁 Project Structure

```text
nexus-media/
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── ThemeToggle.tsx
│   │   │   └── Toolbar.tsx
│   │   ├── file-system/
│   │   │   ├── FileGrid.tsx
│   │   │   ├── FileItem.tsx
│   │   │   └── FileTree.tsx
│   │   ├── layout/
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── media-player/
│   │       ├── AudioPlayer.tsx
│   │       ├── ImageViewer.tsx
│   │       ├── MediaModal.tsx
│   │       └── VideoPlayer.tsx
│   ├── config/
│   │   ├── env.ts
│   │   └── index.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   ├── fileController.ts
│   │   ├── mediaController.ts
│   │   └── searchController.ts
│   ├── hooks/
│   │   ├── useDebounce.ts
│   │   ├── useFileSystem.ts
│   │   ├── useMediaPlayer.ts
│   │   └── useSelection.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   ├── csrf.ts
│   │   ├── errorHandler.ts
│   │   └── rateLimiter.ts
│   ├── pages/
│   │   ├── Explorer.tsx
│   │   └── Login.tsx
│   ├── routes/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── index.ts
│   ├── services/
│   │   ├── fileService.ts
│   │   ├── mediaService.ts
│   │   ├── treeService.ts
│   │   └── zipService.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── api.ts
│   │   ├── constants.ts
│   │   ├── logger.ts
│   │   └── sanitize.ts
│   ├── app.ts
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── server.ts
├── public/
│   └── favicon.ico
├── views/
│   ├── index.ejs
│   └── login.ejs
├── assets/
│   └── preview-dark.png
├── Media_Library/          # Root directory serving demo media files
│   ├── Audio/
│   ├── Documents/
│   ├── Images/
│   └── Videos/
├── .env.example
├── .gitignore
├── metadata.json
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

---

## 🏗 Architecture

### System Architecture Diagram

```text
+-----------------------------------------------------------------------------------+
|                                  CLIENT LAYER (React 19)                           |
|                                                                                   |
|   +-------------------+    +----------------------------+    +----------------+   |
|   |    Login Page     |    |     Explorer Main View     |    |  Media Modal   |   |
|   |  (Session Auth)   |    | (Breadcrumb / Tree / Grid) |    | (Audio/Video/  |   |
|   |                   |    |                            |    |  ImageViewer)  |   |
|   +---------+---------+    +-------------+--------------+    +-------+--------+   |
+-------------|----------------------------|---------------------------|------------+
              |                            |                           |
              | REST API / JSON            | Fetch API / Range         | Binary / ZIP
              v                            v                           v
+-----------------------------------------------------------------------------------+
|                             EXPRESS API SERVER (Node.js)                           |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                           MIDDLEWARE PIPELINE                               |  |
|  |   Helmet.js  --->  Express Session  --->  CSRF Check  --->  Rate Limiter   |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------v---------------------------------------+  |
|  |                            ROUTERS & CONTROLLERS                            |  |
|  |   /login & /logout           /api/contents & /api/tree        /api/media    |  |
|  |   AuthController             FileController                   MediaController  |  |
|  +-------------------------------------+---------------------------------------+  |
|                                        |                                          |
|  +-------------------------------------v---------------------------------------+  |
|  |                            SERVICE LAYER & UTILS                            |  |
|  |   FileService       MediaService       ZipService       SanitizePath        |  |
|  +-------------------------------------+---------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                              FILE SYSTEM LAYER (ROOT_DIR)                         |
|                                                                                   |
|    Media_Library/                                                                 |
|    ├── Audio/  (mp3, wav, flac)       ├── Images/  (png, jpg, webp)              |
|    ├── Videos/ (mp4, webm, mkv)       └── Documents/ (pdf, txt, json)             |
+-----------------------------------------------------------------------------------+
```

---

### Authentication Flow Diagram

```text
 Client (React)                    Express Auth Router                Session Store
   |                                      |                                 |
   |--- 1. POST /login (credentials) ---->|                                 |
   |                                      |--- 2. Verify User & Password --->|
   |                                      |    (bcrypt.compare)             |
   |                                      |                                 |
   |                                      |--- 3. Create Session Record --->|
   |                                      |<-- 4. Session ID Generated -----|
   |                                      |                                 |
   |<-- 5. Set-Cookie: connect.sid -------|                                 |
   |    200 OK { success: true }          |                                 |
   |                                      |                                 |
   |--- 6. GET /api/contents -------------|                                 |
   |    (Cookie: connect.sid)             |--- 7. Validate Cookie --------->|
   |                                      |<-- 8. Session Valid ------------|
   |<-- 9. 200 OK [ FileInfo[] ] ---------|                                 |
```

---

### Media Streaming Flow Diagram

```text
 Client (Video/Audio Player)            MediaController                  File System
   |                                         |                                |
   |--- 1. GET /api/media?path=video.mp4 --->|                                |
   |    Header: Range: bytes=0-1048575       |--- 2. Sanitize Path Check ---->|
   |                                         |    (Prevent Traversal)         |
   |                                         |                                |
   |                                         |--- 3. Stat File & Read Size -->|
   |                                         |<-- 4. File Stats (Size) -------|
   |                                         |                                |
   |                                         |--- 5. Create Read Stream ----->|
   |                                         |    fs.createReadStream()       |
   |                                         |<-- 6. Binary Chunk Stream -----|
   |<-- 7. 206 Partial Content --------------|                                |
   |    Content-Range: bytes 0-1048575/5242880|                                |
   |    Content-Length: 1048576              |                                |
```

---

## 🔒 Security

Nexus Media integrates enterprise security standards across every tier of the stack.

### 1. Authentication
Sessions are managed via HTTP-only session cookies signed with `SESSION_SECRET`. User credentials are saved as salted hashes using `bcryptjs`.

```typescript
// Password Hash Verification Snippet
import bcrypt from 'bcryptjs';

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}
```

### 2. CSRF Protection
All state-modifying requests (`POST`, `PUT`, `DELETE`) validate the `x-csrf-token` HTTP header against the token issued to the active session.

```typescript
// CSRF Validation Middleware Snippet
export function csrfProtection(req: Request, res: Response, next: NextFunction) {
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  if (!token || token !== req.session.csrfToken) {
    return res.status(403).json({ success: false, error: 'Invalid CSRF token' });
  }
  next();
}
```

### 3. Rate Limiting Configuration

| Route Pattern | Window Time | Max Allowed Requests |
| :--- | :--- | :--- |
| `/api/*` | 1 Minute | 100 requests per IP |
| `/login` | 15 Minutes | 5 attempts per IP |

### 4. Path Traversal Prevention
User-supplied paths are strictly sanitized to ensure no operations can access files outside the designated `ROOT_DIR`.

```typescript
// Path Traversal Prevention Snippet
export function sanitizePath(baseDir: string, targetPath: string): string {
  const safePath = path.normalize(targetPath).replace(/^(\.\.[\/\\])+/, '');
  const resolved = path.resolve(baseDir, safePath);
  if (!resolved.startsWith(path.resolve(baseDir))) {
    throw new Error('Access denied: Directory traversal detected');
  }
  return resolved;
}
```

### 5. Security Headers (Helmet.js)
```typescript
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
```

### 6. Security Audit Checklist
- [x] Session cookie flagged with `HttpOnly` and `SameSite=Strict`
- [x] Passwords stored as `bcrypt` hashes with minimum salt rounds of 10
- [x] Input parameters sanitized against directory traversal (`../`)
- [x] Anti-CSRF tokens enforced on non-idempotent endpoints
- [x] Rate limiting enabled on login and public API routes
- [x] Helmet security headers active
- [x] Generic error responses to prevent information leakage
- [x] Hidden dotfiles (`.env`, `.git`) ignored from filesystem indexing
- [x] Streaming downloads handled with backpressure safety
- [x] Memory caps enforced on batch compression jobs

---

## 📡 API Documentation

**Base URL:** `http://localhost:3000/api`

---

### 1. Authentication Endpoints

#### `POST /login`
Authenticates a user and establishes a session.

- **Request Body:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "username": "admin",
      "role": "admin"
    }
  }
  ```

#### `POST /logout`
Terminates the active session.

- **Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

---

### 2. File Operations Endpoints

#### `GET /api/contents`
Retrieves directory contents for a given path.

- **Query Parameters:**
  - `path` *(optional)*: Relative folder path (e.g., `Images/Nature`).
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "sunset.jpg",
        "path": "/Media_Library/Images/sunset.jpg",
        "relativePath": "Images/sunset.jpg",
        "type": "file",
        "size": 2458920,
        "sizeFormatted": "2.34 MB",
        "extension": "jpg",
        "modified": "2026-08-01 14:20",
        "isMedia": true,
        "isAudio": false,
        "isVideo": false,
        "isImage": true
      }
    ]
  }
  ```

#### `GET /api/tree`
Fetches directory tree node structure for sidebar navigation.

- **Query Parameters:**
  - `path` *(optional)*: Subtree root path.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "Audio",
        "path": "/Media_Library/Audio",
        "relativePath": "Audio",
        "type": "directory",
        "children": []
      }
    ]
  }
  ```

---

### 3. Media Streaming & Downloads

#### `GET /api/media`
Streams an audio, video, or image file with Range header support.

- **Query Parameters:**
  - `path`: Relative media file path.
- **Headers:**
  - `Range: bytes=0-1048575` *(optional)*
- **Response:**
  - `206 Partial Content` (for byte range requests)
  - `200 OK` (for complete media delivery)

#### `GET /api/download`
Downloads a single file as an attachment.

- **Query Parameters:**
  - `path`: Relative file path.
- **Response:** Binary attachment stream (`Content-Disposition: attachment`).

#### `POST /api/download-zip`
Generates and streams a ZIP archive containing multiple selected files.

- **Request Body:**
  ```json
  {
    "files": ["Audio/track1.mp3", "Images/photo.jpg"]
  }
  ```
- **Response:** Streamed ZIP binary archive (`Content-Type: application/zip`).

---

### 4. Search Endpoint

#### `GET /api/search`
Performs real-time search across the file system.

- **Query Parameters:**
  - `q`: Search query string.
  - `path` *(optional)*: Directory path scope.
- **Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "name": "podcast_episode1.mp3",
        "relativePath": "Audio/podcast_episode1.mp3",
        "type": "file",
        "sizeFormatted": "14.2 MB",
        "matchScore": 0.95
      }
    ]
  }
  ```

---

### HTTP Status Codes Summary

| Code | Meaning | Cause |
| :--- | :--- | :--- |
| **200** | OK | Request processed successfully |
| **206** | Partial Content | Successful media chunk stream |
| **400** | Bad Request | Missing parameters or invalid body payload |
| **401** | Unauthorized | Unauthenticated request to protected route |
| **403** | Forbidden | CSRF mismatch or directory traversal blocked |
| **404** | Not Found | Requested file or folder does not exist |
| **429** | Too Many Requests | Exceeded rate limit thresholds |
| **500** | Internal Server Error | Server execution error |

---

## 🛠 Built With

### Backend Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Node.js / Express** | `4.21.2` | Core Web Server |
| **TypeScript** | `5.8.2` | Type-Safe Language |
| **bcryptjs** | `3.0.3` | Password Hashing |
| **express-session** | `1.19.0` | Session Middleware |
| **helmet** | `8.3.0` | HTTP Security Headers |
| **express-rate-limit** | `8.6.2` | Rate Limiting |
| **fs-extra** | `11.4.0` | Enhanced File System Operations |
| **archiver** | `8.0.0` | Streaming ZIP Archiver |
| **mime-types** | `3.0.2` | File MIME Type Lookup |
| **winston** | `3.19.0` | Structured Application Logging |
| **zod** | `4.4.3` | Schema Validation |
| **dotenv** | `17.2.3` | Environment Variable Management |

### Frontend Stack

| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **React** | `19.0.1` | User Interface Framework |
| **Tailwind CSS** | `4.1.14` | Utility-First Styling Engine |
| **Vite** | `6.2.3` | Build System & Asset Bundler |
| **Lucide React** | `0.546.0` | Iconography Suite |
| **Motion** | `12.23.24` | Animation Library |

---

## 🧪 Testing

Nexus Media includes unit and integration testing setups.

### Unit Test Example (`FileService.test.ts`)

```typescript
import { sanitizePath } from '../src/utils/sanitize';

describe('SanitizePath Utility', () => {
  const baseDir = '/var/media';

  test('resolves valid relative paths within base directory', () => {
    const result = sanitizePath(baseDir, 'music/song.mp3');
    expect(result).toBe('/var/media/music/song.mp3');
  });

  test('throws error on directory traversal attempt', () => {
    expect(() => {
      sanitizePath(baseDir, '../../etc/passwd');
    }).toThrow('Access denied: Directory traversal detected');
  });
});
```

### Running Tests

```bash
# Execute unit & integration test suites
npm test

# Generate test coverage reports
npm test -- --coverage
```

---

## 🤝 Contributing

Contributions make the open-source community an incredible place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

### Steps to Contribute

1. **Fork the Repository**
2. **Create a Feature Branch:**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your Changes:**
   ```bash
   git commit -m 'feat: Add some AmazingFeature'
   ```
4. **Push to the Branch:**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Commit Message Guidelines

We follow Conventional Commits specification:
- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation updates
- `style:` Formatting changes with no production code effect
- `refactor:` Code refactoring without functionality changes
- `test:` Adding or updating tests

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` file for more information.

```text
MIT License

Copyright (c) 2024 JS-TOOLS-LAB

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

### Built With ❤️ Using
- [Google AI Studio](https://ai.studio)
- [Lucide Icons](https://lucide.dev)
- [Tailwind CSS](https://tailwindcss.com)

### Inspired By
- PHP Media Explorer
- VSCode File Explorer
- Spotify Web Player

---

## 📊 Project Statistics

<p align="center">
  <a href="https://github.com/JS-TOOLS-LAB/nexus-media">
    <img src="https://img.shields.io/github/stars/JS-TOOLS-LAB/nexus-media?style=social" alt="Stars" />
    <img src="https://img.shields.io/github/forks/JS-TOOLS-LAB/nexus-media?style=social" alt="Forks" />
    <img src="https://img.shields.io/github/watchers/JS-TOOLS-LAB/nexus-media?style=social" alt="Watchers" />
    <img src="https://img.shields.io/github/issues/JS-TOOLS-LAB/nexus-media" alt="Issues" />
    <img src="https://img.shields.io/github/last-commit/JS-TOOLS-LAB/nexus-media" alt="Last Commit" />
  </a>
</p>

---

## 💬 Contact & Support

- **Repository:** [https://github.com/JS-TOOLS-LAB/nexus-media](https://github.com/JS-TOOLS-LAB/nexus-media)
- **Issue Tracker:** [https://github.com/JS-TOOLS-LAB/nexus-media/issues](https://github.com/JS-TOOLS-LAB/nexus-media/issues)
- **Email:** [mrjvsibanyoni@gmail.com](mailto:mrjvsibanyoni@gmail.com)
- **Lead Developer:** **Mr JV Sibanyoni** ([@JS-TOOLS-LAB](https://github.com/JS-TOOLS-LAB))

---

<div align="center">
  <p>Made with ❤️ by <strong>JS-TOOLS-LAB</strong></p>
  <p><a href="#top">⬆ Back to Top</a></p>
</div>
