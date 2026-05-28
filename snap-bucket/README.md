# 📦 snap-bucket

### Elegant S3 uploads directly from the browser with built-in progress tracking.

[![npm version](https://img.shields.io/npm/v/snap-bucket.svg?style=flat-flat&color=3178c6)](https://www.npmjs.com/package/snap-bucket)
[![License](https://img.shields.io/github/license/underskore-studios/snap-bucket-sdk?style=flat-flat&color=44cc11)](https://github.com/underskore-studios/snap-bucket-sdk/blob/main/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dm/snap-bucket.svg?style=flat-flat&color=ff69b4)](https://www.npmjs.com/package/snap-bucket)

`snap-bucket` is the frontend companion SDK of the Snap Bucket ecosystem. It abstracts the complexity of requesting pre-signed S3 upload URLs, orchestrating multi-step uploads, managing Content-Type configuration, tracking binary upload progress, and handling network errors into a single, type-safe API call.

---

## 🚀 Features

*   **Zero S3 Credentials Exposed:** AWS keys never touch your client-side code.
*   **Direct S3 Streaming:** Files upload directly from the user's browser to S3, bypassing server bottleneck.
*   **Ultra-lightweight:** No bulky `@aws-sdk` bundles inside your web app.
*   **Real-time Progress:** Built-in exact progress indicators (0% to 100%) for interactive user interfaces.
*   **Programmatic S3 Prefixing:** Optional folder configuration for cataloging assets.
*   **Fully Type-Safe:** Ships with robust TypeScript definitions.

---

## 📦 Installation

Install the package via npm, yarn, or pnpm:

```bash
npm install snap-bucket
# or
yarn add snap-bucket
# or
pnpm add snap-bucket
```

---

## ⚡ Quick Start

### 1. Initialize the SDK
Initialize the SDK once at the root level of your application (e.g., `main.tsx` or `index.ts`):

```typescript
import { init } from "snap-bucket";

init({
  endpoint: "http://localhost:3000/api/upload" // Your backend express route mounting snap-bucket-server
});
```

### 2. Upload a File
Invoke `uploadFile` inside your file selection event handler:

```typescript
import { uploadFile } from "snap-bucket";

async function handleFileUpload(file: File) {
  try {
    const fileUrl = await uploadFile({
      file,
      folder: "user-assets",
      onProgress: (progress) => {
        console.log(`Upload Progress: ${progress}%`);
      }
    });

    console.log("Uploaded successfully! Public URL:", fileUrl);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
```

---

## 💻 Full React Example with Progress Bar

Here is how to build a production-grade React file uploader using `snap-bucket`:

```tsx
import React, { useState } from "react";
import { init, uploadFile } from "snap-bucket";

// Initialize Snap Bucket at app startup
init({
  endpoint: "http://localhost:3000/api/upload"
});

export const Uploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const executeUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const url = await uploadFile({
        file,
        folder: "profile-images",
        onProgress: (percent) => {
          setProgress(percent);
        }
      });
      setUploadedUrl(url);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Profile Asset Uploader</h3>
      <form onSubmit={executeUpload}>
        <input type="file" onChange={onFileChange} disabled={uploading} />
        <button type="submit" disabled={!file || uploading}>
          {uploading ? "Uploading..." : "Upload to S3"}
        </button>
      </form>

      {uploading && (
        <div style={styles.track}>
          <div style={{ ...styles.bar, width: `${progress}%` }} />
          <span style={styles.progressText}>{progress}%</span>
        </div>
      )}

      {error && <p style={styles.error}>{error}</p>}
      {uploadedUrl && (
        <div style={styles.success}>
          <p>File successfully uploaded!</p>
          <a href={uploadedUrl} target="_blank" rel="noreferrer">Open Asset</a>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    maxWidth: "400px",
    fontFamily: "sans-serif"
  },
  track: {
    height: "20px",
    width: "100%",
    backgroundColor: "#eee",
    borderRadius: "10px",
    marginTop: "15px",
    position: "relative" as const,
    overflow: "hidden" as const
  },
  bar: {
    height: "100%",
    backgroundColor: "#4caf50",
    transition: "width 0.1s ease-out"
  },
  progressText: {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "12px",
    fontWeight: "bold" as const,
    color: "#000"
  },
  error: { color: "red", marginTop: "10px" },
  success: { color: "green", marginTop: "10px" }
};
```

---

## 📖 API Reference

### `init()`
Configures the global SDK parameters. Must be invoked before performing any upload operations.

```typescript
function init(config: SDKConfig): void;
```

**Parameters:**
*   `endpoint` (`string`): The server URL hosting your `snap-bucket-server` router handler.
*   `apiKey` (`string`, *optional*): An optional string passed under the `Authorization` header to secure your backend route.

---

### `uploadFile()`
Orchestrates S3 signed-url negotiation and streams the file binary directly using standard `PUT` requests with full progress reporting.

```typescript
function uploadFile(options: UploadFileOptions): Promise<string>;
```

**Parameters:**
*   `file` (`File`): The browser-native file object.
*   `folder` (`string`, *optional*): S3 directory prefix (e.g. `avatars`, `invoices/2026`).
*   `onProgress` (`(progress: number) => void`, *optional*): Triggers progress updates as rounded integers (`0-100`).

**Returns:**
*   `Promise<string>`: The publicly accessible S3 asset URL.

---

## 🚨 Troubleshooting

### S3 CORS Blocks Uploads
If your upload console logs `CORS policy: No 'Access-Control-Allow-Origin' header is present...`, S3 is rejecting PUT streams from your localhost origin. 
**Solution:** Enable `PUT` methods for your client origin in your AWS S3 bucket's CORS policy permissions tab.

### `Upload failed` error throws immediately
Ensure your backend has `express.json()` middleware configured **before** registering the snap-bucket-server router, otherwise, it cannot parse the JSON request to allocate a signed URL.

---

## 📄 License
MIT
