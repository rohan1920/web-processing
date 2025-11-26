import axios from 'axios';
import { UploadResponse } from '../types/upload.types';
import { TableExtractResponse } from '../types/table.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

const jsonClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const uploadService = {
  uploadPdf: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<UploadResponse>('/upload', formData);
    return response.data;
  },
};

export const tableExtractService = {
  extractTables: async (filePath: string): Promise<TableExtractResponse> => {
    const response = await jsonClient.post<TableExtractResponse>('/table-extract', {
      file_path: filePath,
    });
    return response.data;
  },
};
