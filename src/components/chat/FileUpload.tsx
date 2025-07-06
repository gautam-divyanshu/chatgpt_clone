"use client";

import { useRef, useState } from 'react';
import { FileUploadProps } from './upload-types';
import { uploadFile } from '../../lib/upload-utils';

export function FileUpload({
  onFileUpload,
  onUploadStart,
  onUploadError,
  className = '',
  multiple = false,
  accept = 'image/*,.pdf,.doc,.docx,.txt,.csv,.xls,.xlsx,.ppt,.pptx',
}: FileUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0]; // For now, handle single file upload
    
    setIsUploading(true);
    onUploadStart?.();

    try {
      const result = await uploadFile(file);
      
      if (result.success && result.file) {
        onFileUpload(result.file);
      } else {
        onUploadError?.(result.error || 'Upload failed');
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    setIsUploading(true);
    onUploadStart?.();

    try {
      const result = await uploadFile(file);
      
      if (result.success && result.file) {
        onFileUpload(result.file);
      } else {
        onUploadError?.(result.error || 'Upload failed');
      }
    } catch (error) {
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        accept={accept}
        multiple={multiple}
        className="hidden"
      />
      
      <button
        onClick={handleClick}
        disabled={isUploading}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className={`
          flex items-center justify-center w-8 h-8 rounded-full 
          chatgpt-hover transition-colors chatgpt-text
          ${isUploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${className}
        `}
        title="Upload file"
      >
        {isUploading ? (
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
            />
          </svg>
        )}
      </button>
    </>
  );
}
