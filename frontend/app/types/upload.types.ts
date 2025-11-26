export interface UploadResponse {
  id: string;
  filename: string;
  originalName: string;
  filePath: string;
  size: number;
  uploadedAt: string;
  extractedText?: string;
  error?: string;
  tables?: Array<{
    rows: number;
    columns: number;
    data: string[][];
    page?: number;
    table_index?: number;
  }>;
}

export interface FilePreview {
  name: string;
  size: number;
  type: string;
  file: File;
}

