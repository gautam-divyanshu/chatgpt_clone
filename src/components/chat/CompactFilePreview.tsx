"use client";

import Image from 'next/image';
import { useState } from 'react';
import { UploadedFile } from './upload-types';
import { getFileIcon, isImageFile } from '../../lib/upload-utils';

interface CompactFilePreviewProps {
  file: UploadedFile;
  onRemove: () => void;
}

export function CompactFilePreview({ file, onRemove }: CompactFilePreviewProps) {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const isImage = isImageFile(file.type);

  const handleClick = () => {
    if (isImage) {
      setShowFullscreen(true);
    } else {
      setShowDocumentViewer(true);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click handler
    onRemove();
  };

  const getViewerUrl = () => {
    if (file.type === 'application/pdf') {
      // For PDFs, use PDF.js viewer
      return `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(file.url)}`;
    } else {
      // For other documents, use Google Docs Viewer
      return `https://docs.google.com/viewer?url=${encodeURIComponent(file.url)}&embedded=true`;
    }
  };

  return (
    <>
      <div className="relative inline-block group">
        {/* File preview container with filename */}
        <div className="flex flex-col items-center">
          {/* File preview */}
          <div className="relative">
            {isImage ? (
              // Image preview - clean, no borders
              <div 
                className="w-12 h-12 rounded cursor-pointer relative overflow-hidden hover:opacity-90 transition-opacity"
                onClick={handleClick}
              >
                <Image
                  src={file.url}
                  alt={file.originalName}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
            ) : (
              // Document icon - clean, no borders
              <div 
                className="w-12 h-12 rounded cursor-pointer flex items-center justify-center text-2xl hover:opacity-80 transition-opacity"
                onClick={handleClick}
                title={`Click to preview ${file.originalName}`}
              >
                {getFileIcon(file.type)}
              </div>
            )}
            
            {/* Remove button - appears on hover */}
            <button
              onClick={handleRemove}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              title="Remove file"
            >
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Filename */}
          <div className="mt-1 max-w-[80px] text-center">
            <span className="text-xs chatgpt-text-muted truncate block" title={file.originalName}>
              {file.originalName}
            </span>
          </div>
        </div>
      </div>

      {/* Fullscreen modal for images */}
      {showFullscreen && isImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFullscreen(false)}
        >
          <div className="relative max-w-full max-h-full">
            <Image
              src={file.url}
              alt={file.originalName}
              width={file.width || 800}
              height={file.height || 600}
              className="max-w-full max-h-full object-contain"
              sizes="100vw"
            />
            
            {/* Close button */}
            <button
              onClick={() => setShowFullscreen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-black bg-opacity-50 hover:bg-opacity-70 rounded-full flex items-center justify-center text-white transition-all"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            {/* File info overlay */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 rounded-lg px-3 py-2 text-white text-sm">
              {file.originalName}
              {file.width && file.height && (
                <div className="text-xs opacity-75">
                  {file.width} × {file.height}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Document viewer modal - much smaller size */}
      {showDocumentViewer && !isImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-12"
          onClick={() => setShowDocumentViewer(false)}
        >
          <div className="relative w-full h-full max-w-2xl max-h-[60vh] bg-[#1f1f1f] rounded-lg overflow-hidden border border-gray-700">
            {/* Dark header */}
            <div className="flex items-center justify-between p-2 bg-[#2a2a2a] border-b border-gray-600">
              <h3 className="text-sm font-medium text-white truncate">
                {file.originalName}
              </h3>
              {/* Close button only */}
              <button
                onClick={() => setShowDocumentViewer(false)}
                className="w-6 h-6 bg-gray-600 hover:bg-gray-500 rounded-full flex items-center justify-center text-gray-200 transition-colors"
              >
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Document viewer iframe */}
            <div className="h-full bg-white" onClick={(e) => e.stopPropagation()}>
              <iframe
                src={getViewerUrl()}
                className="w-full h-full border-0"
                title={`Preview of ${file.originalName}`}
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}