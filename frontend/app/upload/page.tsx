'use client';

import { useState } from 'react';
import FileDropzone from './components/FileDropzone';
import ExtractedTextView from './components/ExtractedTextView';
import ExtractedTablesView from './components/ExtractedTablesView';
import { uploadService, tableExtractService } from '../services/api.service';
import { UploadResponse } from '../types/upload.types';
import { TableExtractResponse } from '../types/table.types';

export default function UploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResponse, setUploadResponse] = useState<UploadResponse | null>(
    null,
  );
  const [tableExtractResponse, setTableExtractResponse] = useState<TableExtractResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExtractingTables, setIsExtractingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadResponse(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setIsLoading(true);
    setError(null);
    setUploadResponse(null);

    try {
      const response = await uploadService.uploadPdf(selectedFile);
      setUploadResponse(response);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to upload file. Please try again.';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtractTables = async () => {
    if (!uploadResponse?.filePath) {
      setError('No file available for table extraction');
      return;
    }

    setIsExtractingTables(true);
    setError(null);
    setTableExtractResponse(null);

    try {
      const response = await tableExtractService.extractTables(uploadResponse.filePath);
      setTableExtractResponse(response);
    } catch (err: any) {
      console.error('Table extraction error:', err);
      console.error('Error response:', err.response);
      console.error('Error data:', err.response?.data);
      
      let errorMessage = 'Failed to extract tables. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsExtractingTables(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setUploadResponse(null);
    setTableExtractResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Upload & Processing
          </h1>
          <p className="text-gray-600">
            Upload a PDF document to extract text using OCR technology
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <FileDropzone
            onFileSelect={handleFileSelect}
            acceptedFile={selectedFile}
          />
        </div>

        {selectedFile && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Selected File
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedFile.name} •{' '}
                  {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
              <div className="flex gap-3">
                {!uploadResponse && (
                  <button
                    onClick={handleUpload}
                    disabled={isLoading}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition-colors
                      ${
                        isLoading
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }
                    `}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Processing...
                      </span>
                    ) : (
                      'Upload & Extract'
                    )}
                  </button>
                )}
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        )}

        {uploadResponse && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Upload Result
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Filename:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {uploadResponse.originalName}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Size:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {(uploadResponse.size / 1024).toFixed(2)} KB
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Uploaded:</span>
                  <span className="ml-2 font-medium text-gray-900">
                    {new Date(uploadResponse.uploadedAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {uploadResponse.extractedText ? 'Extracted' : 'Processed'}
                  </span>
                </div>
              </div>
            </div>

            {uploadResponse.extractedText && (
              <div className="border-t border-gray-200 pt-6">
                <ExtractedTextView text={uploadResponse.extractedText} />
              </div>
            )}

            {uploadResponse.error && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">{uploadResponse.error}</p>
              </div>
            )}

            {/* Table Extraction Section */}
            {uploadResponse && !tableExtractResponse && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Table Extraction
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Extract structured tables from the PDF document
                    </p>
                  </div>
                  <button
                    onClick={handleExtractTables}
                    disabled={isExtractingTables}
                    className={`
                      px-6 py-2 rounded-lg font-medium transition-colors
                      ${
                        isExtractingTables
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }
                    `}
                  >
                    {isExtractingTables ? (
                      <span className="flex items-center gap-2">
                        <svg
                          className="animate-spin h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Extracting...
                      </span>
                    ) : (
                      'Extract Tables'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Extracted Tables Display */}
            {tableExtractResponse && (
              <div className="border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Extracted Tables
                </h3>
                <ExtractedTablesView tables={tableExtractResponse.tables} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
