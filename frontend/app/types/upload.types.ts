export interface UploadResponse {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  size: number;
  uploadedAt: string;
  extractedText?: string;
  error?: string;
}

export interface FilePreview {
  name: string;
  size: number;
  type: string;
  file: File;
}

