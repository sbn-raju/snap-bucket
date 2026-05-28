# 📦 Snap Bucket

### Effortless S3 uploads. Zero server-side overhead. One simple API.

[![npm version](https://img.shields.io/npm/v/snap-bucket.svg?style=flat-flat&color=3178c6)](https://www.npmjs.com/package/snap-bucket)
[![License](https://img.shields.io/github/license/sbn-raju/snap-bucket?style=flat-flat&color=44cc11)](https://github.com/sbn-raju/snap-bucket/blob/main/LICENSE)
[![NPM Downloads](https://img.shields.io/npm/dm/snap-bucket.svg?style=flat-flat&color=ff69b4)](https://www.npmjs.com/package/snap-bucket)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-flat&logo=typescript)](https://www.typescriptlang.org/)

**Snap Bucket** is a unified, lightweight npm ecosystem designed to completely abstract the complexity of secure client-side S3 uploads. By splitting the operations between a zero-dependency-like backend router and a robust progress-aware frontend client, Snap Bucket eliminates the boilerplate of AWS SDKs, pre-signed URL configurations, security credential management, and manual request orchestration.

### The Ecosystem

The Snap Bucket ecosystem consists of two lightweight, purpose-built packages:

*   **`snap-bucket`** (Frontend SDK): A client-side library that handles secure communication with your backend to retrieve a pre-signed URL, uploads the file directly to S3 with built-in progress tracking, and returns the public asset URL.
*   **`snap-bucket-server`** (Backend SDK): An Express-compatible middleware/router that securely generates S3 pre-signed upload URLs using your AWS credentials, ensuring your secret keys are never exposed to the client.

---

## 💡 Why Snap Bucket?

Uploading files to AWS S3 from the browser has historically been a painful, boilerplate-heavy process. Developers typically face two suboptimal architectures:

1.  **Proxying Uploads Through the Server:** The client uploads the file to the application backend, and the backend uploads it to S3. This introduces immense memory pressure, increases server bandwidth costs, and bottlenecks your app during concurrent uploads.
2.  **Direct Uploads via Pre-signed URLs:** The client requests a pre-signed URL, the backend generates it, the client parses it, performs a manual `fetch` or `XMLHttpRequest` with exact HTTP headers, handles S3 XML error responses, manages folder prefixes, and implements manual progress trackers.

### Traditional S3 Upload Flow vs. Snap Bucket

| Operation Phase | Traditional Manual S3 Flow ❌ | With Snap Bucket ⚡ |
| :--- | :--- | :--- |
| **Backend Setup** | Instantiating `@aws-sdk/client-s3`, setting up `PutObjectCommand`, computing expiration times, generating pre-signed URLs, handling manual route parsing, and writing custom Express endpoints. | Single `createUploadRouter()` instantiation. Complete AWS SDK abstraction. |
| **Frontend Setup** | Fetching signed URL, extracting fields, building multi-step `PUT` requests, specifying exact S3 headers, tracking raw bytes, and mapping output URLs. | Simple `await uploadFile({ file })` call with built-in callbacks. |
| **Security Risk** | Accidentally exposing AWS keys in client builds or configuring over-privileged S3 public access patterns. | Seamless, isolated backend token issuance. Zero client-side credential exposure. |
| **Maintenance** | ~150 lines of complex, error-prone, custom-maintained upload code across frontend and backend. | **Under 15 lines** of clean, readable, type-safe declarative code. |

---

## ✨ Features

*   **Direct-to-S3 Uploads:** Files go straight from the user's browser to your S3 bucket, saving server bandwidth and memory.
*   **Zero AWS SDK on the Frontend:** Completely eliminates large AWS SDK bundles from your client-side build.
*   **Granular Progress Tracking:** Native XHR-backed progress callbacks provide real-time updates for UI progress bars.
*   **Built-in Folder Organization:** Seamlessly group assets into S3 subfolders using the optional dynamic `folder` parameter.
*   **Complete TypeScript Safety:** Fully typed interfaces for all options, parameters, config blocks, and responses.
*   **Robust Error Handling:** Clear, isolated error states that guarantee failures are caught and surfaced cleanly.
*   **Secure by Design:** Credentials remain safely sealed on the backend; the client only ever receives short-lived, single-use upload tokens.

---

## 🎨 Architecture Diagram

The diagram below illustrates the secure three-way handshake executed by Snap Bucket to securely upload assets directly to S3:

```
┌──────────┐          1. Request Pre-signed URL           ┌────────────────────┐
│          ├─────────────────────────────────────────────>│                    │
│          │    (Sends File Name, Content Type, Folder)   │                    │
│          │                                              │                    │
│  Client  │          2. Generate & Return URL            │  Express Backend   │
│ Browser  │<─────────────────────────────────────────────│ (snap-bucket-server│
│ (using   │        { uploadUrl, finalFileUrl }           │   using AWS SDK)   │
│  snap-   │                                              │                    │
│ bucket)  │          3. Direct S3 Upload (PUT)           └────────────────────┘
│          ├──────────────────────────────────────────┐
│          │                                          │
└──────────┘                                          ▼
     ▲                                      ┌──────────────────┐
     │                                      │                  │
     └──────────────────────────────────────┤  Amazon S3 Bucket│
           4. File Uploaded successfully    │                  │
                                            └──────────────────┘
```

---

## 📦 Installation

Install the respective package in the appropriate directory of your project:

### Frontend Client
```bash
# In your frontend project directory
npm install snap-bucket
```

### Backend Server
```bash
# In your backend project directory
npm install snap-bucket-server
```

---

## 🚀 Quick Start

Here is how simple it is to get up and running.

### 1. Backend Integration

Configure the upload router inside your Express application:

```ts
import express from "express";
import { createUploadRouter } from "snap-bucket-server";

const app = express();

// IMPORTANT: Requires JSON body parser middleware
app.use(express.json());

// Mount the upload router
app.use(
  "/upload-url",
  createUploadRouter({
    bucket: process.env.AWS_BUCKET!,
    region: process.env.AWS_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  })
);

app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
```

### 2. Frontend Initialization & Upload

Initialize the SDK and upload a file in your client application:

```ts
import { init, uploadFile } from "snap-bucket";

// Initialize client with the backend endpoint
init({
  endpoint: "http://localhost:3000/upload-url"
});

// Perform the upload
async function handleUpload(file: File) {
  try {
    const url = await uploadFile({
      file,
      folder: "avatars",
      onProgress: (progress) => {
        console.log(`Upload progress: ${progress}%`);
      }
    });
    console.log("File uploaded successfully! URL:", url);
  } catch (error) {
    console.error("Upload failed:", error);
  }
}
```

---

## ⚙️ Backend Setup

### Environment Variables

Do not hardcode your AWS credentials. Create a `.env` file in the root of your backend project:

```env
PORT=3000
AWS_REGION=us-east-1
AWS_BUCKET=your-production-bucket-name
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Full Express Integration Example

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createUploadRouter } from "snap-bucket-server";

// Load environment variables
dotenv.config();

const app = express();

// Enable CORS for frontend requests
app.use(cors({
  origin: "http://localhost:5173", // Your frontend dev server
  credentials: true
}));

// Parse JSON request bodies
app.use(express.json());

// Mount router
app.use(
  "/api/upload",
  createUploadRouter({
    bucket: process.env.AWS_BUCKET!,
    region: process.env.AWS_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  })
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
```

---

## 💻 Frontend Setup

### React / Vite Example

Here is a full, real-world React component demonstrating a profile image uploader with interactive state, styled progress tracking, and error handling.

```tsx
import React, { useState } from "react";
import { init, uploadFile } from "snap-bucket";

// Initialize snap-bucket once at application start
init({
  endpoint: "http://localhost:3000/api/upload"
});

export const ProfileUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setError("");

    try {
      const url = await uploadFile({
        file,
        folder: "profile-images",
        onProgress: (p) => {
          setProgress(p);
        }
      });
      setAvatarUrl(url);
      setFile(null);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.title}>Update Profile Picture</h2>
      
      <form onSubmit={handleUpload} style={styles.form}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange} 
          disabled={uploading}
          style={styles.fileInput}
        />
        
        <button 
          type="submit" 
          disabled={!file || uploading} 
          style={uploading ? styles.buttonDisabled : styles.button}
        >
          {uploading ? "Uploading..." : "Upload Image"}
        </button>
      </form>

      {uploading && (
        <div style={styles.progressContainer}>
          <div style={{ ...styles.progressBar, width: `${progress}%` }} />
          <span style={styles.progressText}>{progress}%</span>
        </div>
      )}

      {error && <p style={styles.errorText}>{error}</p>}
      
      {avatarUrl && (
        <div style={styles.successContainer}>
          <p style={styles.successText}>Upload Complete!</p>
          <img src={avatarUrl} alt="Avatar" style={styles.previewImage} />
          <a href={avatarUrl} target="_blank" rel="noreferrer" style={styles.link}>
            View original asset
          </a>
        </div>
      )}
    </div>
  );
};

// Sleek CSS-in-JS design system styles
const styles = {
  card: {
    maxWidth: "400px",
    margin: "40px auto",
    padding: "24px",
    borderRadius: "16px",
    backgroundColor: "#ffffff",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.05)",
    fontFamily: "system-ui, -apple-system, sans-serif"
  },
  title: {
    fontSize: "20px",
    fontWeight: 600,
    color: "#1e293b",
    marginBottom: "20px",
    textAlign: "center" as const
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "16px"
  },
  fileInput: {
    padding: "10px",
    border: "1px dashed #cbd5e1",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "14px"
  },
  button: {
    padding: "12px 16px",
    backgroundColor: "#3b82f6",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "background-color 0.2s"
  },
  buttonDisabled: {
    padding: "12px 16px",
    backgroundColor: "#94a3b8",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    fontWeight: 600,
    cursor: "not-allowed"
  },
  progressContainer: {
    marginTop: "20px",
    height: "20px",
    backgroundColor: "#f1f5f9",
    borderRadius: "999px",
    overflow: "hidden",
    position: "relative" as const
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#10b981",
    transition: "width 0.1s ease-out"
  },
  progressText: {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    fontSize: "12px",
    fontWeight: 700,
    color: "#1e293b"
  },
  errorText: {
    marginTop: "12px",
    color: "#ef4444",
    fontSize: "14px",
    textAlign: "center" as const
  },
  successContainer: {
    marginTop: "24px",
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center"
  },
  successText: {
    color: "#10b981",
    fontWeight: 600,
    marginBottom: "12px"
  },
  previewImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover" as const,
    border: "3px solid #f1f5f9"
  },
  link: {
    marginTop: "10px",
    fontSize: "13px",
    color: "#3b82f6",
    textDecoration: "none"
  }
};
```

---

## 📖 API Reference

### Frontend Package (`snap-bucket`)

#### `init()`
Initializes global configuration parameters for the frontend SDK. Must be called once before invoking `uploadFile`.

```typescript
function init(config: SDKConfig): void;
```

**Parameters:**
*   `config` (`SDKConfig`): An object containing initialization options.
    *   `endpoint` (`string`): The full absolute URL of your Express backend server endpoint mounting `createUploadRouter`.
    *   `apiKey` (`string`, *optional*): An optional API authorization key passed in the headers.

---

#### `uploadFile()`
Orchestrates the entire upload process: requests the signed URL, executes direct S3 transfer via `XMLHttpRequest` with full progress reporting, and returns the final asset URL.

```typescript
function uploadFile(options: UploadFileOptions): Promise<string>;
```

**Parameters:**
*   `options` (`UploadFileOptions`): An object representing the upload payload.
    *   `file` (`File`): The browser-native `File` object to upload (obtained from `<input type="file">` or drag-and-drop actions).
    *   `folder` (`string`, *optional*): A custom folder namespace prefix to place the file under inside your S3 bucket.
    *   `onProgress` (`(progress: number) => void`, *optional*): Callback function invoked during upload. Receives a rounded percentage integer between `0` and `100`.

**Returns:**
*   `Promise<string>`: Resolves to the final publicly accessible HTTP address of the uploaded file on AWS S3.

---

### Backend Package (`snap-bucket-server`)

#### `createUploadRouter()`
Generates a complete, plug-and-play Express Router containing a safe `POST` endpoint configuration mapping to AWS S3 client commands.

```typescript
function createUploadRouter(config: ConnectifyConfig): express.Router;
```

**Parameters:**
*   `config` (`ConnectifyConfig`): An object wrapping your secret AWS credentials.
    *   `bucket` (`string`): The target Amazon S3 bucket name.
    *   `region` (`string`): The AWS region identifier where your bucket resides (e.g. `us-east-1`).
    *   `accessKeyId` (`string`): The IAM user Access Key ID with write access to S3.
    *   `secretAccessKey` (`string`): The IAM user Secret Access Key.

**Returns:**
*   `express.Router`: An Express-compatible router instance configured to handle JSON POST payloads representing signed URL requests.

---

## 🔄 Upload Flow Explained

To guarantee absolute security and client independence, Snap Bucket employs a 4-phase transaction sequence under the hood:

```
                                            [ Client Browser ]                      [ Node.js Backend ]                 [ Amazon S3 ]
                                                    |                                        |                                |
Phase 1: Token Negotiations                         |--- POST JSON (fileName, mime, folder) ->|                                |
                                                    |                                        |-- validate & init S3 client    |
                                                    |                                        |-- call S3 getSignedUrl()       |
                                                    |<-- RESPOND JSON {uploadUrl, fileUrl} --|                                |
                                                    |                                                                         |
Phase 2: Client Connection Setup                    |-- instantiate XMLHttpRequest                                            |
                                                    |-- set PUT method & Content-Type header                                  |
                                                    |                                                                         |
Phase 3: Direct-to-S3 Streaming                     |======================== HTTP PUT Raw Binary stream ====================>|
                                                    |-- trigger onprogress callbacks (0-100%)                                 |
                                                    |<======================= HTTP 200 OK Response ===========================|
                                                    |                                                                         |
Phase 4: Resolution & Returns                       |-- Resolve Promise with final S3 fileUrl                                 |
                                                    V                                                                         V
```

---

## 📁 Folder Uploads

The optional `folder` parameter in `uploadFile()` automatically prefixes your asset key inside the S3 bucket to achieve programmatic file organization.

```typescript
const url = await uploadFile({
  file,
  folder: "users/avatars/thumbnail"
});
```

### Safe Collision Handling
To prevent accidental file overwrites where different users upload files with identical names (e.g. `image.png`), Snap Bucket server automatically prefixes the uploaded filename with a unique timestamp:

`{folder}/{timestamp}-{fileName}`

**Example:**
*   Input file: `profile.jpg`
*   Input folder: `user-uploads`
*   Resulting S3 Key: `user-uploads/1716911681000-profile.jpg`
*   Returned URL: `https://my-bucket.s3.us-east-1.amazonaws.com/user-uploads/1716911681000-profile.jpg`

---

## 📊 Upload Progress

The SDK guarantees highly performant progress tracking by leveraging modern `XMLHttpRequest.upload` progress event streams instead of polling or guessing intervals. 

The value passed to your `onProgress` callback is an integer representing the exact percent of bytes uploaded to S3:

$$\text{progress} = \text{Math.round}\left(\frac{\text{bytesSent}}{\text{totalBytes}} \times 100\right)$$

```typescript
uploadFile({
  file,
  onProgress: (progress) => {
    // Highly accurate integer updates: 1, 2, ... 99, 100
    updateProgressBarUI(progress);
  }
});
```

---

## 🚨 Error Handling

Snap Bucket exposes clean, custom exceptions. If anything fails during the network negotiations or S3 uploads, an `UploadError` is thrown on the client:

```typescript
import { uploadFile } from "snap-bucket";

try {
  const url = await uploadFile({ file });
} catch (error: any) {
  if (error.name === "UploadError") {
    console.error("Identified Snap Bucket SDK error:", error.message);
  } else {
    console.error("General network or application error:", error);
  }
}
```

### Backend Failures
If S3 client creation or authorization fails on your server, `createUploadRouter` catches the AWS exception, prints the stack trace via `console.error` for easy debugging, and returns a clean `500 Internal Server Error` with JSON content:

```json
{
  "message": "Failed to generate signed URL"
}
```

---

## 📂 Example Project Structure

A clean fullstack implementation utilizing Snap Bucket typically resembles the following structure:

```
my-upload-app/
├── backend/
│   ├── .env                  # Backend AWS secrets
│   ├── package.json          # Dependency definition (includes snap-bucket-server)
│   └── server.ts             # Express initialization & routing
└── frontend/
    ├── package.json          # Dependency definition (includes snap-bucket)
    ├── src/
    │   ├── main.tsx          # Application entrypoint (calls init())
    │   └── Uploader.tsx      # React file upload component
    └── tsconfig.json
```

---

## 🧪 Testing Locally

To test S3 uploads locally, follow these steps:

1.  **Configure local environment credentials:** In your backend project, add real S3 sandbox credentials to `.env`.
2.  **Enable CORS on your S3 Bucket:** S3 blocks direct browser uploads by default. Follow the CORS guide in the Troubleshooting section.
3.  **Start your Express Server:** Launch your backend application (e.g. on `http://localhost:3000`).
4.  **Launch your frontend bundler:** Run Vite or Next.js (e.g. on `http://localhost:5173`).
5.  **Perform an upload:** Select a small image or document. Verify the progress state reaches 100%, and double check that the returned URL is valid and opens the file in your browser.

---

## 🛠️ Troubleshooting

### 1. `express.json()` Middleware Issues
If you encounter `TypeError: Cannot read properties of undefined (reading 'fileName')` on your Express backend, you forgot to register the JSON parser middleware.

```typescript
// ❌ WRONG: Body parsing omitted or added after the router
app.use("/upload-url", createUploadRouter({ ... }));
app.use(express.json());

//  CORRECT: Body parser must be mounted BEFORE the upload router
app.use(express.json());
app.use("/upload-url", createUploadRouter({ ... }));
```

### 2. `multipart/form-data` vs `application/json`
Do **not** wrap your frontend inputs in a `FormData` object or send them as multipart form data. The `snap-bucket` frontend client initiates communication with your Node server by exchanging a light JSON payload (containing metadata like file name and content type). Once the token is returned, the client streams the file binary directly using `application/json` boundaries via S3 PUT parameters.

### 3. S3 CORS Policy Blocking Uploads (Cross-Origin Resource Sharing)
If your console shows `Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy`, your AWS S3 bucket is blocking client PUT requests. 

You must apply a CORS policy to your S3 bucket.

#### How to fix:
1. Open the **AWS Console** and navigate to your **S3 Bucket**.
2. Click on the **Permissions** tab.
3. Scroll down to **Cross-origin resource sharing (CORS)** and click **Edit**.
4. Paste the following JSON configuration and save changes:

```json
[
  {
    "AllowedHeaders": [
      "*"
    ],
    "AllowedMethods": [
      "PUT",
      "POST",
      "GET"
    ],
    "AllowedOrigins": [
      "http://localhost:5173",
      "https://your-production-app.com"
    ],
    "ExposeHeaders": [
      "ETag"
    ],
    "MaxAgeSeconds": 3000
  }
]
```

### 4. Missing AWS Environment Variables
If your server crashes on launch or returned responses are `500`, make sure you are loading environment variables properly. Add this at the absolute top of your entry file:

```typescript
import dotenv from "dotenv";
dotenv.config(); // Must be invoked before createUploadRouter
```

### 5. AWS IAM Permission Issues
If S3 returns `403 Forbidden` during client PUT execution, your IAM credentials lack adequate write permissions. Make sure the IAM policy assigned to your API credentials has the `s3:PutObject` action enabled:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}
```

### 6. Module Import Issues (ESM vs CJS)
Both SDK packages are compiled supporting Dual-Module formats (shipping both CommonJS and ES Modules). 
*   If using ESM (`"type": "module"` in `package.json`), use standard `import`:
    ```typescript
    import { init } from "snap-bucket";
    ```
*   If using standard Node.js CommonJS:
    ```javascript
    const { createUploadRouter } = require("snap-bucket-server");
    ```

---

## 🔒 Security

Snap Bucket implements elite, enterprise-grade architecture security principles:

*   **No Secret Exposure:** AWS Access Keys and Secret Keys are strictly restricted to the backend environment. They are never transmitted over the network to the frontend client or bundled in the client code.
*   **Pre-Signed PUT Operations:** S3 pre-signed URLs are restricted to a single S3 Key (exactly the target file location) and are configured with a strict expiration window of **60 seconds**.
*   **Zero Server Hijacking:** Because the frontend uploads binaries directly to S3, your application server is never exposed to denial of service (DoS) attacks through large file upload streams.

---

## ❓ FAQ

#### Can I use this with frameworks like Next.js?
Yes. Next.js API Routes act as standard Express middleware targets. You can import `createUploadRouter` inside your custom route handlers or backend servers.

#### Does this support private files?
Currently, Snap Bucket returns a standard public GET URL. For secure private downloads, stay tuned for pre-signed download support in upcoming minor releases.

#### Do I need to clean up aborted uploads?
No. Because uploads stream directly to S3 via signed URLs, aborted requests expire naturally in 60 seconds with zero residual server/bucket memory leakage.

---

## 🗺️ Roadmap

We are constantly looking to enhance developer experience. Future items on our product roadmap include:

*   [ ] **Multiple File Uploads:** Native batch upload APIs (`uploadFiles()`).
*   [ ] **Built-in Auto-Retries:** Intelligent Exponential Backoff mechanics for shaky mobile connections.
*   [ ] **Drop-in UI Components:** Beautiful drag-and-drop React/Vue components matching modern design systems.
*   [ ] **Cloudflare R2 & Supabase Storage Support:** Universal cloud target support.
*   [ ] **Upload Cancellation:** Native support for aborting live uploads mid-progress.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
