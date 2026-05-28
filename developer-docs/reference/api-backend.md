# Backend API Reference

This page describes the API types and router generator exported by the `snap-bucket-server` package.

---

## 🛠️ Main Entrypoint

### `createUploadRouter()`
Instantiates a complete Express Router configured to generate AWS S3 pre-signed upload URLs.

```typescript
function createUploadRouter(config: ConnectifyConfig): express.Router;
```

#### Parameters: `ConnectifyConfig`
| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `bucket` | `string` | **Yes** | The exact name of your target S3 bucket. |
| `region` | `string` | **Yes** | AWS location region (e.g. `us-east-1`, `eu-west-3`). |
| `accessKeyId` | `string` | **Yes** | Secure AWS Access Key assigned to the S3 writer IAM user. |
| `secretAccessKey` | `string` | **Yes** | Secure AWS Secret Access Key assigned to the S3 writer IAM user. |

**Example:**
```typescript
import { createUploadRouter } from "snap-bucket-server";

const uploadRouter = createUploadRouter({
  bucket: "my-app-storage",
  region: "us-west-2",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
});
```

---

## 🔌 Router Endpoint Mechanics

When mounted, the generated router listens for `POST` requests at its base path (`/`).

### Expected Request Payload
* **Headers:** `Content-Type: application/json`
* **Body Type:** `SignedUrlBody`
```typescript
interface SignedUrlBody {
  fileName: string;     // Original name of the target file
  contentType: string;  // MIME type (e.g. image/png, application/pdf)
  folder?: string;      // Optional subdirectory path
}
```

### Successful Response Format
* **HTTP Status:** `200 OK`
* **Body Type:** `SignedUrlResponse`
```typescript
interface SignedUrlResponse {
  uploadUrl: string; // The S3 pre-signed target URL for PUT requests
  fileUrl: string;   // The final public URL where the asset resides
}
```

### Error Response Format
* **HTTP Status:** `400 Bad Request` (validation issues) or `500 Internal Server Error` (AWS communication failures).
* **Response Body:**
```json
{
  "message": "fileName missing" // or "Failed to generate signed URL"
}
```
