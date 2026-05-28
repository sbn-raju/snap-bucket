export interface SDKConfig {
  endpoint: string;
  apiKey?: string;
}

export interface UploadFileOptions {
  file: File;
  folder?: string;
  onProgress?: (progress: number) => void;
}

export interface SignedUrlResponse {
  uploadUrl: string;
  fileUrl: string;
}