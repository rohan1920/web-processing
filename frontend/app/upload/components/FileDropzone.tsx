'use client';

import { useCallback, useState } from 'react';
import { FilePreview } from '../../types/upload.types';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  acceptedFile?: File | null;
}

export default function FileDropzone({
  onFileSelect,
  acceptedFile,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<FilePreview | null>(
    acceptedFile
      ? {
          name: acceptedFile.name,
          size: acceptedFile.size,
          type: acceptedFile.type,
          file: acceptedFile,
        }
      : null,
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setPreview({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
          });
          onFileSelect(file);
        }
      }
    },
    [onFileSelect],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (validateFile(file)) {
          setPreview({
            name: file.name,
            size: file.size,
            type: file.type,
            file: file,
          });
          onFileSelect(file);
        }
      }
    },
    [onFileSelect],
  );

  const validateFile = (file: File): boolean => {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Only PDF files are allowed');
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return false;
    }
    return true;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full">
      <div
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-gray-50 hover:border-gray-400'
          }
        `}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg
                className="w-16 h-16 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">{preview.name}</p>
              <p className="text-xs text-gray-500">{formatFileSize(preview.size)}</p>
            </div>
            <button
              onClick={() => {
                setPreview(null);
                const input = document.getElementById('file-input') as HTMLInputElement;
                if (input) input.value = '';
              }}
              className="text-sm text-red-600 hover:text-red-700"
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">
                {isDragging ? 'Drop the PDF file here' : 'Drag & drop a PDF file here'}
              </p>
              <p className="text-xs text-gray-500">or click to browse</p>
              <p className="text-xs text-gray-400">Only PDF files (Max 10MB)</p>
            </div>
            <label className="inline-block">
              <input
                id="file-input"
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInput}
                className="hidden"
              />
              <span className="inline-block px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                Select PDF File
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
