import { UploadResponse } from '../components/chat/upload-types';

export async function uploadFile(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;
  } catch (error) {
    console.error('Upload error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function getFileIcon(type: string): string {
  if (type.startsWith('image/')) return '🖼️';
  if (type === 'application/pdf') return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('sheet') || type.includes('excel')) return '📊';
  if (type.includes('presentation') || type.includes('powerpoint')) return '📽️';
  if (type === 'text/plain') return '📄';
  if (type === 'text/csv') return '📋';
  return '📁';
}

export function isImageFile(type: string): boolean {
  return type.startsWith('image/');
}

export function isDocumentFile(type: string): boolean {
  const documentTypes = [
    'application/pdf',
    'text/plain',
    'text/csv',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
  ];
  return documentTypes.includes(type);
}

/**
 * Downloads a file from a URL with proper filename
 * Handles both direct downloads and blob creation for CORS issues
 */
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    
    // For files hosted on Cloudinary or other CDNs, we might need to fetch and create blob
    if (url.includes('cloudinary.com') || url.includes('googleapis.com')) {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          credentials: 'omit'
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        link.href = blobUrl;
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL after a short delay
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        
      } catch (fetchError) {
        console.warn('Failed to fetch file via blob, trying direct download:', fetchError);
        // Fallback to direct link
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } else {
      // Direct download for other URLs
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  } catch (error) {
    console.error('Download failed:', error);
    // Ultimate fallback: open in new tab
    window.open(url, '_blank');
  }
}