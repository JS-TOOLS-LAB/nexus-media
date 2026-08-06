// public/js/app.ts

export interface MediaFileItem {
  name: string;
  relativePath: string;
  sizeFormatted: string;
  type: string;
  icon: string;
  isAudio: boolean;
  isVideo: boolean;
  isImage: boolean;
  modified: string;
}

export class MediaExplorerClient {
  private currentPath: string = '';
  private viewMode: 'grid' | 'list' = 'grid';
  private selectedFiles: Set<string> = new Set();

  constructor() {
    this.init();
  }

  private init(): void {
    console.log('Media Explorer client initialized');
  }

  public navigateTo(pathStr: string): void {
    this.currentPath = pathStr;
  }
}
