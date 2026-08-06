// public/js/app.js

class MediaExplorer {
  constructor() {
    this.currentPath = '';
    this.history = [''];
    this.historyIndex = 0;
    this.viewMode = localStorage.getItem('media_view_mode') || 'grid';
    this.theme = localStorage.getItem('media_theme') || 'dark';
    this.selectedFiles = new Set();
    this.currentFiles = [];
    this.mediaQueue = [];
    this.currentMediaIndex = -1;

    // Elements
    this.fileViewContainer = document.getElementById('file-view-container');
    this.fileTreeContainer = document.getElementById('file-tree-container');
    this.breadcrumbContainer = document.getElementById('breadcrumb-container');
    this.searchInput = document.getElementById('search-input');
    this.clearSearchBtn = document.getElementById('clear-search-btn');
    this.selectedCountEl = document.getElementById('selected-count');
    this.downloadSelectedBtn = document.getElementById('btn-download-selected');
    this.selectionBar = document.getElementById('selection-bar');
    this.selectionText = document.getElementById('selection-text');
    this.selectAllCheckbox = document.getElementById('select-all-checkbox');
    this.btnBack = document.getElementById('btn-back');
    this.btnForward = document.getElementById('btn-forward');
    this.btnRefresh = document.getElementById('btn-refresh');

    // CSRF token
    const metaCsrf = document.querySelector('meta[name="csrf-token"]');
    this.csrfToken = metaCsrf ? metaCsrf.getAttribute('content') : '';

    this.init();
  }

  init() {
    this.applyTheme(this.theme);
    this.applyViewMode(this.viewMode);
    this.bindEvents();
    this.loadFolder(this.currentPath);
    this.loadTree('');
  }

  // Theme Handling
  applyTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('media_theme', theme);
    const themeBtnIcon = document.querySelector('#theme-toggle-btn i');
    if (themeBtnIcon) {
      themeBtnIcon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    }
  }

  toggleTheme() {
    const nextTheme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme(nextTheme);
  }

  // View Mode Handling
  applyViewMode(mode) {
    this.viewMode = mode;
    localStorage.setItem('media_view_mode', mode);
    
    const btnGrid = document.getElementById('btn-view-grid');
    const btnList = document.getElementById('btn-view-list');

    if (btnGrid && btnList) {
      btnGrid.classList.toggle('active', mode === 'grid');
      btnList.classList.toggle('active', mode === 'list');
    }

    if (this.fileViewContainer) {
      this.fileViewContainer.className = `file-view ${mode}-view`;
    }
    this.renderFiles(this.currentFiles);
  }

  bindEvents() {
    // Theme button
    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => this.toggleTheme());

    // View mode buttons
    document.getElementById('btn-view-grid')?.addEventListener('click', () => this.applyViewMode('grid'));
    document.getElementById('btn-view-list')?.addEventListener('click', () => this.applyViewMode('list'));

    // Navigation buttons
    this.btnBack?.addEventListener('click', () => this.navigateBack());
    this.btnForward?.addEventListener('click', () => this.navigateForward());
    this.btnRefresh?.addEventListener('click', () => this.loadFolder(this.currentPath));
    document.getElementById('refresh-tree-btn')?.addEventListener('click', () => this.loadTree(''));

    // Mobile sidebar toggle
    document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
      document.getElementById('explorer-sidebar')?.classList.toggle('open');
    });

    // Search input debounced
    let searchTimeout;
    this.searchInput?.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      const query = e.target.value;
      this.clearSearchBtn?.classList.toggle('hidden', query.length === 0);
      searchTimeout = setTimeout(() => {
        if (query.trim().length > 0) {
          this.searchFiles(query.trim());
        } else {
          this.loadFolder(this.currentPath);
        }
      }, 300);
    });

    this.clearSearchBtn?.addEventListener('click', () => {
      if (this.searchInput) this.searchInput.value = '';
      this.clearSearchBtn?.classList.add('hidden');
      this.loadFolder(this.currentPath);
    });

    // Bulk selection & download
    this.selectAllCheckbox?.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      if (isChecked) {
        this.currentFiles.forEach(f => this.selectedFiles.add(f.relativePath));
      } else {
        this.selectedFiles.clear();
      }
      this.updateSelectionUI();
      this.renderFiles(this.currentFiles);
    });

    document.getElementById('clear-selection-btn')?.addEventListener('click', () => {
      this.selectedFiles.clear();
      this.updateSelectionUI();
      this.renderFiles(this.currentFiles);
    });

    this.downloadSelectedBtn?.addEventListener('click', () => this.downloadSelectedAsZip());

    // Audio player controls
    this.setupAudioPlayer();

    // Modals close buttons
    document.getElementById('close-video-modal')?.addEventListener('click', () => this.closeVideoModal());
    document.getElementById('video-modal-backdrop')?.addEventListener('click', () => this.closeVideoModal());
    document.getElementById('close-image-modal')?.addEventListener('click', () => this.closeImageModal());
    document.getElementById('image-modal-backdrop')?.addEventListener('click', () => this.closeImageModal());

    // Image Modal Nav
    document.getElementById('image-btn-prev')?.addEventListener('click', () => this.navigateMedia(-1, 'image'));
    document.getElementById('image-btn-next')?.addEventListener('click', () => this.navigateMedia(1, 'image'));

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeVideoModal();
        this.closeImageModal();
      } else if (e.key === 'a' && (e.ctrlKey || e.metaKey)) {
        if (document.activeElement.tagName !== 'INPUT') {
          e.preventDefault();
          this.currentFiles.forEach(f => this.selectedFiles.add(f.relativePath));
          this.updateSelectionUI();
          this.renderFiles(this.currentFiles);
        }
      }
    });
  }

  // Load Folder Contents
  async loadFolder(pathStr) {
    this.showLoading();
    try {
      const res = await fetch(`/api/contents?path=${encodeURIComponent(pathStr)}`);
      const json = await res.json();

      if (!json.success) {
        this.showToast(json.error || 'Failed to load folder', 'error');
        return;
      }

      this.currentPath = json.path || '';
      this.currentFiles = json.data || [];
      this.selectedFiles.clear();
      this.updateSelectionUI();

      this.renderBreadcrumbs();
      this.renderFiles(this.currentFiles);
      this.updateNavigationState();
    } catch (err) {
      this.showToast('Network error loading folder', 'error');
    }
  }

  // Navigate to path
  navigateTo(pathStr) {
    if (this.currentPath !== pathStr) {
      // Trim forward history if navigating new branch
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(pathStr);
      this.historyIndex = this.history.length - 1;
      this.loadFolder(pathStr);
    }
  }

  navigateBack() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.loadFolder(this.history[this.historyIndex]);
    }
  }

  navigateForward() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.loadFolder(this.history[this.historyIndex]);
    }
  }

  updateNavigationState() {
    if (this.btnBack) this.btnBack.disabled = this.historyIndex <= 0;
    if (this.btnForward) this.btnForward.disabled = this.historyIndex >= this.history.length - 1;
  }

  // Render Breadcrumbs
  renderBreadcrumbs() {
    if (!this.breadcrumbContainer) return;
    this.breadcrumbContainer.innerHTML = '';

    const parts = this.currentPath ? this.currentPath.split('/') : [];
    
    // Root item
    const rootSpan = document.createElement('span');
    rootSpan.className = `breadcrumb-item ${parts.length === 0 ? 'active' : ''}`;
    rootSpan.innerHTML = '<i class="fa-solid fa-house"></i> Root';
    rootSpan.onclick = () => this.navigateTo('');
    this.breadcrumbContainer.appendChild(rootSpan);

    let accumulatedPath = '';
    parts.forEach((part, idx) => {
      const sep = document.createElement('span');
      sep.className = 'breadcrumb-separator';
      sep.innerHTML = '<i class="fa-solid fa-chevron-right"></i>';
      this.breadcrumbContainer.appendChild(sep);

      accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
      const targetPath = accumulatedPath;

      const itemSpan = document.createElement('span');
      itemSpan.className = `breadcrumb-item ${idx === parts.length - 1 ? 'active' : ''}`;
      itemSpan.textContent = part;
      if (idx !== parts.length - 1) {
        itemSpan.onclick = () => this.navigateTo(targetPath);
      }
      this.breadcrumbContainer.appendChild(itemSpan);
    });
  }

  // Render Sidebar Tree
  async loadTree(relPath) {
    try {
      const res = await fetch(`/api/tree?path=${encodeURIComponent(relPath)}`);
      const json = await res.json();
      if (json.success && this.fileTreeContainer) {
        this.fileTreeContainer.innerHTML = '';
        this.renderTreeNodes(json.data, this.fileTreeContainer);
      }
    } catch {
      // ignore
    }
  }

  renderTreeNodes(nodes, container) {
    nodes.forEach(node => {
      if (node.type !== 'directory') return; // Display directory tree only

      const div = document.createElement('div');
      div.className = 'tree-node';

      const itemDiv = document.createElement('div');
      itemDiv.className = `tree-item ${this.currentPath === node.relativePath ? 'active' : ''}`;
      itemDiv.innerHTML = `
        <span class="tree-toggle"><i class="fa-solid fa-chevron-right"></i></span>
        <span class="tree-icon"><i class="fa-solid ${node.icon}"></i></span>
        <span class="tree-name">${this.escapeHtml(node.name)}</span>
      `;

      itemDiv.onclick = (e) => {
        e.stopPropagation();
        this.navigateTo(node.relativePath);
      };

      div.appendChild(itemDiv);

      if (node.children && node.children.length > 0) {
        const childrenDiv = document.createElement('div');
        childrenDiv.className = 'tree-children';
        this.renderTreeNodes(node.children, childrenDiv);
        div.appendChild(childrenDiv);
      }

      container.appendChild(div);
    });
  }

  // Render File Items
  renderFiles(files) {
    if (!this.fileViewContainer) return;
    this.fileViewContainer.innerHTML = '';

    if (!files || files.length === 0) {
      this.fileViewContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-folder-open empty-icon"></i>
          <h3>This folder is empty</h3>
          <p>No files or subdirectories found in current path.</p>
        </div>
      `;
      return;
    }

    if (this.viewMode === 'grid') {
      files.forEach(file => {
        const card = document.createElement('div');
        const isSelected = this.selectedFiles.has(file.relativePath);
        card.className = `grid-card ${isSelected ? 'selected' : ''}`;
        
        let mediaPreviewHtml = `<i class="fa-solid ${file.icon}"></i>`;
        if (file.isImage) {
          mediaPreviewHtml = `<img src="/api/media?path=${encodeURIComponent(file.relativePath)}" alt="${this.escapeHtml(file.name)}" class="grid-thumb" loading="lazy" />`;
        }

        card.innerHTML = `
          <input type="checkbox" class="grid-checkbox" ${isSelected ? 'checked' : ''} />
          <div class="grid-icon-wrapper">${mediaPreviewHtml}</div>
          <div class="grid-card-content">
            <div class="grid-name" title="${this.escapeHtml(file.name)}">${this.escapeHtml(file.name)}</div>
            <div class="grid-meta-badge">
              <span class="file-type-pill">${file.type === 'directory' ? 'Folder' : (file.mediaType ? file.mediaType.toUpperCase() : 'FILE')}</span>
              <span>${file.type === 'directory' ? '' : file.sizeFormatted}</span>
            </div>
          </div>
        `;

        const checkbox = card.querySelector('.grid-checkbox');
        checkbox.onclick = (e) => {
          e.stopPropagation();
          this.toggleSelection(file.relativePath);
        };

        card.onclick = () => {
          if (file.type === 'directory') {
            this.navigateTo(file.relativePath);
          } else {
            this.handleFileClick(file);
          }
        };

        this.fileViewContainer.appendChild(card);
      });
    } else {
      // List view
      files.forEach(file => {
        const item = document.createElement('div');
        const isSelected = this.selectedFiles.has(file.relativePath);
        item.className = `list-item ${isSelected ? 'selected' : ''}`;

        item.innerHTML = `
          <input type="checkbox" class="list-checkbox" ${isSelected ? 'checked' : ''} />
          <div class="list-icon"><i class="fa-solid ${file.icon}"></i></div>
          <div class="list-name">${this.escapeHtml(file.name)}</div>
          <div class="list-size">${file.sizeFormatted}</div>
          <div class="list-date">${new Date(file.modified).toLocaleDateString()}</div>
        `;

        const checkbox = item.querySelector('.list-checkbox');
        checkbox.onclick = (e) => {
          e.stopPropagation();
          this.toggleSelection(file.relativePath);
        };

        item.onclick = () => {
          if (file.type === 'directory') {
            this.navigateTo(file.relativePath);
          } else {
            this.handleFileClick(file);
          }
        };

        this.fileViewContainer.appendChild(item);
      });
    }
  }

  handleFileClick(file) {
    if (file.isAudio) {
      this.playAudio(file);
    } else if (file.isVideo) {
      this.playVideo(file);
    } else if (file.isImage) {
      this.openImageModal(file);
    } else {
      // Download non-media file
      window.location.href = `/api/download?path=${encodeURIComponent(file.relativePath)}`;
    }
  }

  toggleSelection(relPath) {
    if (this.selectedFiles.has(relPath)) {
      this.selectedFiles.delete(relPath);
    } else {
      this.selectedFiles.add(relPath);
    }
    this.updateSelectionUI();
    this.renderFiles(this.currentFiles);
  }

  updateSelectionUI() {
    const count = this.selectedFiles.size;
    if (this.selectedCountEl) this.selectedCountEl.textContent = count;
    if (this.downloadSelectedBtn) this.downloadSelectedBtn.classList.toggle('hidden', count === 0);
    if (this.selectionBar) this.selectionBar.classList.toggle('hidden', count === 0);
    if (this.selectionText) this.selectionText.textContent = `${count} item${count === 1 ? '' : 's'} selected`;
    if (this.selectAllCheckbox) {
      this.selectAllCheckbox.checked = count > 0 && count === this.currentFiles.length;
    }
  }

  // Bulk ZIP Download
  async downloadSelectedAsZip() {
    if (this.selectedFiles.size === 0) return;
    const pathsArray = Array.from(this.selectedFiles);

    try {
      this.showToast('Preparing ZIP download...', 'info');
      const response = await fetch('/api/download-zip', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': this.csrfToken,
        },
        body: JSON.stringify({ paths: pathsArray }),
      });

      if (!response.ok) {
        const errJson = await response.json();
        this.showToast(errJson.error || 'Failed to generate ZIP', 'error');
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `media-export-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      this.showToast('ZIP Download started', 'success');
    } catch {
      this.showToast('Error generating ZIP archive', 'error');
    }
  }

  // Search
  async searchFiles(query) {
    this.showLoading();
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}&path=${encodeURIComponent(this.currentPath)}`);
      const json = await res.json();
      if (json.success) {
        this.currentFiles = json.data;
        this.renderFiles(this.currentFiles);
      }
    } catch {
      this.showToast('Search request failed', 'error');
    }
  }

  // Audio Player Logic
  setupAudioPlayer() {
    const audioEl = document.getElementById('html5-audio-element');
    const playBtn = document.getElementById('audio-btn-play');
    const progressBar = document.getElementById('audio-progress');
    const volumeBar = document.getElementById('audio-volume');
    const timeCurrent = document.getElementById('audio-time-current');
    const timeDuration = document.getElementById('audio-time-duration');
    const closeBtn = document.getElementById('audio-btn-close');

    if (!audioEl) return;

    playBtn?.addEventListener('click', () => {
      if (audioEl.paused) {
        audioEl.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      } else {
        audioEl.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      }
    });

    audioEl.addEventListener('timeupdate', () => {
      if (audioEl.duration) {
        const pct = (audioEl.currentTime / audioEl.duration) * 100;
        if (progressBar) progressBar.value = pct;
        if (timeCurrent) timeCurrent.textContent = this.formatTime(audioEl.currentTime);
        if (timeDuration) timeDuration.textContent = this.formatTime(audioEl.duration);
      }
    });

    progressBar?.addEventListener('input', (e) => {
      if (audioEl.duration) {
        audioEl.currentTime = (e.target.value / 100) * audioEl.duration;
      }
    });

    volumeBar?.addEventListener('input', (e) => {
      audioEl.volume = parseFloat(e.target.value);
    });

    closeBtn?.addEventListener('click', () => {
      audioEl.pause();
      document.getElementById('audio-player-bar')?.classList.add('hidden');
    });

    document.getElementById('audio-btn-prev')?.addEventListener('click', () => this.navigateMedia(-1, 'audio'));
    document.getElementById('audio-btn-next')?.addEventListener('click', () => this.navigateMedia(1, 'audio'));
  }

  playAudio(file) {
    const bar = document.getElementById('audio-player-bar');
    const audioEl = document.getElementById('html5-audio-element');
    const titleEl = document.getElementById('audio-title');
    const subEl = document.getElementById('audio-sub');
    const playBtn = document.getElementById('audio-btn-play');

    if (bar && audioEl) {
      bar.classList.remove('hidden');
      if (titleEl) titleEl.textContent = file.name;
      if (subEl) subEl.textContent = file.sizeFormatted;

      audioEl.src = `/api/media?path=${encodeURIComponent(file.relativePath)}`;
      audioEl.play().then(() => {
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
      }).catch(() => {
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
      });

      // Update queue
      this.mediaQueue = this.currentFiles.filter(f => f.isAudio);
      this.currentMediaIndex = this.mediaQueue.findIndex(f => f.relativePath === file.relativePath);
    }
  }

  // Video Player Logic
  playVideo(file) {
    const modal = document.getElementById('video-modal');
    const videoEl = document.getElementById('html5-video-element');
    const titleEl = document.getElementById('video-modal-title');

    if (modal && videoEl) {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-video"></i> ${this.escapeHtml(file.name)}`;
      videoEl.src = `/api/media?path=${encodeURIComponent(file.relativePath)}`;
      modal.classList.remove('hidden');
      videoEl.play();
    }
  }

  closeVideoModal() {
    const modal = document.getElementById('video-modal');
    const videoEl = document.getElementById('html5-video-element');
    if (modal) modal.classList.add('hidden');
    if (videoEl) {
      videoEl.pause();
      videoEl.src = '';
    }
  }

  // Image Modal Logic
  openImageModal(file) {
    const modal = document.getElementById('image-modal');
    const imgEl = document.getElementById('image-modal-img');
    const titleEl = document.getElementById('image-modal-title');
    const downloadLink = document.getElementById('image-download-link');

    this.mediaQueue = this.currentFiles.filter(f => f.isImage);
    this.currentMediaIndex = this.mediaQueue.findIndex(f => f.relativePath === file.relativePath);

    if (modal && imgEl) {
      if (titleEl) titleEl.innerHTML = `<i class="fa-solid fa-image"></i> ${this.escapeHtml(file.name)}`;
      const mediaUrl = `/api/media?path=${encodeURIComponent(file.relativePath)}`;
      imgEl.src = mediaUrl;
      if (downloadLink) downloadLink.href = `/api/download?path=${encodeURIComponent(file.relativePath)}`;
      modal.classList.remove('hidden');
    }
  }

  closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) modal.classList.add('hidden');
  }

  navigateMedia(direction, type) {
    if (this.mediaQueue.length === 0) return;
    this.currentMediaIndex += direction;
    if (this.currentMediaIndex < 0) this.currentMediaIndex = this.mediaQueue.length - 1;
    if (this.currentMediaIndex >= this.mediaQueue.length) this.currentMediaIndex = 0;

    const nextFile = this.mediaQueue[this.currentMediaIndex];
    if (type === 'image') {
      this.openImageModal(nextFile);
    } else if (type === 'audio') {
      this.playAudio(nextFile);
    }
  }

  // Helpers
  showLoading() {
    if (this.fileViewContainer) {
      this.fileViewContainer.innerHTML = `
        <div class="empty-state">
          <i class="fa-solid fa-spinner fa-spin empty-icon"></i>
          <h3>Loading contents...</h3>
        </div>
      `;
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'error' ? 'fa-circle-exclamation' : (type === 'success' ? 'fa-circle-check' : 'fa-info-circle');
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${this.escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MediaExplorer();
});
