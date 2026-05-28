# Frontend Setup

`snap-bucket` provides a lightweight, fully typed frontend interface to execute secure direct-to-S3 uploads in any browser runtime.

---

## 🛠️ Step 1: SDK Initialization

Invoke the global `init` function once during your application lifecycle (typically in your main React `main.tsx`, Next.js entrypoint, or raw `index.js` file).

```typescript
import { init } from "snap-bucket";

init({
  endpoint: "http://localhost:3000/api/upload", // Points to your mounted backend Express route
  apiKey: "your-optional-api-authorization-token" // Optional header value
});
```

---

## 📁 Step 2: Upload Files with Folder Support

Group and manage assets into specific directory namespaces using the optional `folder` option. Filename collisions (e.g. uploading two files named `profile.jpg`) are automatically resolved by the backend generator using unique timestamps.

```typescript
import { uploadFile } from "snap-bucket";

async function onFileSelected(file: File) {
  try {
    const fileUrl = await uploadFile({
      file,
      folder: "users/avatars", // Placed securely in: S3_BUCKET/users/avatars/[timestamp]-[name]
      onProgress: (progress) => {
        console.log(`Live S3 Upload percent: ${progress}%`);
      }
    });

    console.log("Uploaded successfully! Public asset location:", fileUrl);
  } catch (error) {
    console.error("Capture upload failure:", error);
  }
}
```

---

## 📊 Step 3: Interactive Progress Reporting

The frontend client utilizes modern XHR state machine listener callbacks instead of performance-heavy intervals. This means your UI progress loaders receive microsecond-exact percentage indicators (`0-100` integers) as bytes hit AWS servers.

```typescript
// Vanilla UI example
uploadFile({
  file,
  onProgress: (percent) => {
    const loader = document.getElementById("progress-loader");
    if (loader) {
      loader.style.width = `${percent}%`;
      loader.innerText = `${percent}%`;
    }
  }
});
```
