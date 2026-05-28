export interface ConnectifyConfig {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface SignedUrlBody {
  fileName: string;
  contentType: string;
  folder?: string;
}