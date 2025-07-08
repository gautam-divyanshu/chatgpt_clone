"use client";

// No longer need Image or useState since we're doing direct download
import { UploadedFile } from './upload-types';
import { getFileIcon, isImageFile, downloadFile } from '../../lib/upload-utils';

interface CompactFilePreviewProps {
  file: UploadedFile;
  onRemove: () => void;
  isProcessing?: boolean;
  processingError?: string | null;
  isProcessed?: boolean;
}

export function CompactFilePreview({ 
  file, 
  onRemove, 
  isProcessing = false, 
  processingError = null,
  isProcessed = false 
}: CompactFilePreviewProps) {
  // Removed modal states since we're doing direct download
  const isImage = isImageFile(file.type);

  const handleClick = async () => {
    // Automatically download the file when clicked
    await downloadFile(file.url, file.originalName);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the click handler
    onRemove();
  };

  const getProcessingStatusIcon = () => {
    if (isProcessing) {
      return (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-2 h-2 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    }
    
    if (processingError) {
      return (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center" title={processingError}>
          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }
    
    if (isProcessed && file.isDocument) {
      return (
        <div className="absolute -top-1 -left-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center" title="Document processed - ready for AI questions">
          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }
    
    return null;
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
                className="w-12 h-12 rounded cursor-pointer relative overflow-hidden hover:opacity-90 transition-opacity bg-cover bg-center"
                onClick={handleClick}
                style={{ backgroundImage: `url(${file.url})` }}
                title={`Click to download ${file.originalName}`}
              >
              </div>
            ) : (
              // Document icon - clean, no borders
              <div 
                className={`w-12 h-12 rounded cursor-pointer flex items-center justify-center text-2xl hover:opacity-80 transition-opacity ${
                  isProcessing ? 'opacity-60' : ''
                }`}
                onClick={handleClick}
                title={`Click to download ${file.originalName}${isProcessed ? ' (AI processed)' : ''}`}
              >
                {getFileIcon(file.type)}
              </div>
            )}
            
            {/* Processing status indicator */}
            {getProcessingStatusIcon()}
            
            {/* Remove button - appears on hover */}
            <button
              onClick={handleRemove}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
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

          {/* Filename with processing status */}
          <div className="mt-1 max-w-[80px] text-center">
            <span className="text-xs chatgpt-text-muted truncate block" title={file.originalName}>
              {file.originalName}
            </span>
            {file.isDocument && (
              <div className="text-xs text-center mt-0.5">
                {isProcessing && <span className="text-blue-400">Processing...</span>}
                {processingError && <span className="text-red-400">Error</span>}
                {isProcessed && !isProcessing && !processingError && (
                  <span className="text-green-400">AI Ready</span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* No modals needed - direct download on click */}
    </>
  );
}
