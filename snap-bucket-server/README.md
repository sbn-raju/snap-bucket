# 📦 snap-bucket-server

### Express middleware to generate secure, short-lived AWS S3 pre-signed upload URLs.

[![npm version](https://img.shields.io/npm/v/snap-bucket-server.svg?style=flat-flat&color=3178c6)](https://www.npmjs.com/package/snap-bucket-server)
[![License](https://img.shields.io/github/license/sbn-raju/snap-bucket?style=flat-flat&color=44cc11)](https://github.com/sbn-raju/snap-bucket/blob/main/LICENSE)

`snap-bucket-server` is the backend companion SDK of the Snap Bucket ecosystem. It creates an Express-compatible router to dynamically validate and issue single-use S3 pre-signed upload URLs directly in response to metadata requests sent by the `snap-bucket` frontend library.

---

## 🚀 Features

*   **Secure by Design:** Your AWS credentials remain sealed in your backend server.
*   **Plug-and-play Express Router:** Mounts in a single line.
*   **Automatic Namespace Prefixing:** Integrated timestamping to avoid S3 file overwrites.
*   **Pre-signed Expiration:** Issues highly restrictive 60-second execution windows.
*   **Fully Typed:** Full TypeScript interfaces out-of-the-box.

---

## 📦 Installation

Install the package and required peer dependencies (e.g. `express`):

```bash
npm install snap-bucket-server
# or
yarn add snap-bucket-server
# or
pnpm add snap-bucket-server
```

---

## ⚡ Quick Start

### 1. Configure S3 Environment Variables
Ensure your system uses appropriate S3 configuration flags. Create a `.env` file:

```env
AWS_REGION=us-east-1
AWS_BUCKET=your-target-bucket-name
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### 2. Mount `createUploadRouter()`
Set up your Express application and register the upload router:

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createUploadRouter } from "snap-bucket-server";

dotenv.config();

const app = express();

// Enable CORS for frontend applications
app.use(cors({
  origin: "http://localhost:5173", // URL of your frontend server
  credentials: true
}));

// CRITICAL: Mount JSON parser middleware BEFORE the router
app.use(express.json());

// Register the Upload endpoint
app.use(
  "/api/upload",
  createUploadRouter({
    bucket: process.env.AWS_BUCKET!,
    region: process.env.AWS_REGION!,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  })
);

app.listen(3000, () => {
  console.log("S3 Token server listening on port 3000");
});
```

---

## 📖 API Reference

### `createUploadRouter()`
Generates an Express Router targeting your bucket parameters.

```typescript
function createUploadRouter(config: ConnectifyConfig): express.Router;
```

**Configuration Options:**
*   `bucket` (`string`): Target Amazon S3 bucket name.
*   `region` (`string`): Bucket region (e.g. `us-east-2`).
*   `accessKeyId` (`string`): IAM User credentials containing S3 write clearance.
*   `secretAccessKey` (`string`): IAM User Secret Key.

**Route Details:**
*   **Method:** `POST`
*   **Path:** `/` (mount endpoint, e.g., `/api/upload`)
*   **Payload Requirements (JSON):**
    ```json
    {
      "fileName": "avatar.jpg",
      "contentType": "image/jpeg",
      "folder": "users/profiles"
    }
    ```
*   **Return Format:**
    ```json
    {
      "uploadUrl": "https://[bucket].s3.[region].amazonaws.com/[folder]/[timestamp]-avatar.jpg?AWSAccessKeyId=...",
      "fileUrl": "https://[bucket].s3.[region].amazonaws.com/[folder]/[timestamp]-avatar.jpg"
    }
    ```

---

## 🛡️ S3 Bucket CORS Settings

Direct browser PUT streams are blocked by S3 default policies. Add this CORS config to your S3 bucket permissions dashboard:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["PUT", "POST", "GET"],
    "AllowedOrigins": ["http://localhost:5173"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3000
  }
]
```

---

## 📄 License
[![License](https://img.shields.io/github/license/sbn-raju/snap-bucket?style=flat-flat&color=44cc11)](https://github.com/sbn-raju/snap-bucket/blob/main/LICENSE)
