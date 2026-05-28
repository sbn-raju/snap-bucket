# Frontend API Reference

This page describes the API types and interfaces exported by the `snap-bucket` package.

---

## ⚙️ Configuration Methods

### `init()`
Establishes baseline SDK configuration keys for secure frontend communications.

```typescript
function init(config: SDKConfig): void;
```

#### Parameters: `SDKConfig`
| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `endpoint` | `string` | **Yes** | Absolute URL destination of your mounted backend API. |
| `apiKey` | `string` | *No* | Custom authentication token added as `Authorization` header on token request. |

**Example:**
```typescript
import { init } from "snap-bucket";

init({
  endpoint: "https://api.yourdomain.com/v1/s3-url",
  apiKey: "user_session_token_xyz"
});
```

---

## 📤 Action Methods

### `uploadFile()`
Retrieves S3 token from your Express backend, generates XML Http binary streams, triggers progress handlers, and resolves the final AWS public location.

```typescript
function uploadFile(options: UploadFileOptions): Promise<string>;
```

#### Parameters: `UploadFileOptions`
| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | `File` | **Yes** | Native Web API `File` object (input, drag-drop, or canvas blob). |
| `folder` | `string` | *No* | Sub-directory path name for organized bucket keys. |
| `onProgress` | `(progress: number) => void` | *No* | Executed with updated upload integer percentages (`0` to `100`). |

#### Returns: `Promise<string>`
Resolves to the final publicly accessible AWS S3 asset URL (e.g. `https://mybucket.s3.us-east-1.amazonaws.com/folder/1716911681000-filename.jpg`).

**Example:**
```typescript
import { uploadFile } from "snap-bucket";

const publicAssetUrl = await uploadFile({
  file: selectedFile,
  folder: "invoices/2026",
  onProgress: (p) => console.log(`${p}% uploaded`)
});
```
