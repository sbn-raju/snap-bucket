# Troubleshooting Guide

Find solutions to common implementation challenges and error states below.

---

## 🛑 Frontend Errors

### `Upload failed` error throws immediately
This typically indicates the client cannot connect to your backend token generator, or the backend fails to parse the POST payload.
* **Checks:**
  1. Verify your backend server is running and accessible (e.g. open `http://localhost:3000` in the browser).
  2. Ensure you have registered the `express.json()` body-parsing middleware **before** the upload router in your backend code.
  3. Inspect your backend terminal logs for any validation or syntax crashes.

### CORS Errors in Browser Console
```
Access to XMLHttpRequest at '...' from origin '...' has been blocked by CORS policy
```
This error indicates S3 is rejecting the client's direct file streaming request.
* **Solution:** Follow the [AWS S3 CORS Configuration Guide](./s3-cors-policy) to apply an explicit CORS policy block admitting your origin domain.

---

## ⚙️ Backend Errors

### `TypeError: Cannot read properties of undefined (reading 'fileName')`
This occurs when the backend router handles a JSON request, but the Express application lacks a JSON request body parser.
* **Solution:** Mount `express.json()` prior to registering the upload router:
  ```typescript
  // ❌ INCORRECT: Router registered first
  app.use("/api/upload", createUploadRouter({ ... }));
  app.use(express.json());

  // ✅ CORRECT: Parser registered first
  app.use(express.json());
  app.use("/api/upload", createUploadRouter({ ... }));
  ```

### `403 Forbidden` response from AWS S3
The backend successfully issued the URL, but S3 rejects the PUT execution.
* **Checks:**
  1. Verify the `accessKeyId` and `secretAccessKey` provided to `createUploadRouter` are completely accurate.
  2. Ensure your IAM user policy permits `s3:PutObject` actions for the specified bucket and path assets.
  3. Confirm the S3 bucket name is typed exactly as it appears in your AWS dashboard.
