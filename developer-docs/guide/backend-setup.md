# Backend Setup

The backend companion SDK `snap-bucket-server` securely processes metadata and issues single-use pre-signed PUT URLs.

---

## 🔑 AWS IAM Credentials

Before initializing the backend, configure a dedicated AWS IAM user with write access to your S3 bucket. Ensure your IAM credentials have permission to execute `s3:PutObject` on the designated bucket paths.

### Sample IAM Policy
Attach the following policy to your IAM user:

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

---

## ⚙️ Environment Variables

Create or update your `.env` file in the root of your Express server project:

```env
PORT=3000
AWS_REGION=us-east-1
AWS_BUCKET=your-production-bucket-name
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

---

## 🚀 Express Router Mounting

Initialize your Express application and register the upload router. 

::: warning CRITICAL REQUIREMENT
You **must** register `express.json()` body-parsing middleware *prior* to mounting `createUploadRouter`. Without it, `req.body` remains undefined, resulting in S3 metadata validation failures.
:::

```typescript
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createUploadRouter } from "snap-bucket-server";

// Load environment variables
dotenv.config();

const app = express();

// Configure CORS to permit frontend origins
app.use(cors({
  origin: ["http://localhost:5173", "https://your-production-app.com"],
  credentials: true
}));

// MUST mount JSON parsing middleware
app.use(express.json());

// Mount the Snap Bucket router
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
  console.log(`Node backend running securely on port ${PORT}`);
});
```
