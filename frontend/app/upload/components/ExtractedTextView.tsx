'use client';

import { useState } from 'react';

interface ExtractedTextViewProps {
  text: string;
}

export default function ExtractedTextView({
  text,
}: ExtractedTextViewProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Extracted Text</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            {wordCount} words • {charCount} characters
          </span>
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>
      <div className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm text-gray-800 font-sans leading-relaxed">
          {text || 'No text extracted from this document.'}
        </pre>
      </div>
    </div>
  );
}
