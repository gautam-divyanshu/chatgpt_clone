export interface UploadedFile {
  id: string;
  url: string;
  originalName: string;
  size: number;
  type: string;
  isImage: boolean;
  isDocument: boolean;
  width?: number | null;
  height?: number | null;
  format: string;
  createdAt: string;
}

export interface UploadResponse {
  success: boolean;
  file?: UploadedFile;
  error?: string;
}

export interface FileUploadProps {
  onFileUpload: (file: UploadedFile) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  className?: string;
  multiple?: boolean;
  accept?: string;
}

export interface FilePreviewProps {
  file: UploadedFile;
  onRemove?: () => void;
  showRemove?: boolean;
}
