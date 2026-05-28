# Introduction & Overview

Welcome to **Snap Bucket** — the developer-first solution to browser-to-S3 uploads.

Uploading assets is a core requirement for almost any modern application, yet configuring secure S3 uploads typically requires developers to write boilerplate AWS clients, figure out IAM policies, secure backend endpoints, parse multipart uploads, and handle intricate client-side chunking/progress events.

Snap Bucket solves this by splitting the upload handshake into two tiny, cooperative packages:

1. **`snap-bucket`** (Frontend SDK): Streams files directly to AWS S3 using standard pre-signed single-use `PUT` requests, tracking percentage updates via micro-callbacks.
2. **`snap-bucket-server`** (Backend SDK): An Express middleware/router that handles authentication and safe key derivation without exposing credentials to the client.

---

## The Core Concept: Secure Direct Streaming

Instead of proxying large file streams through your Node server (which consumes bandwidth, incurs high costs, and risks memory exhaustion), Snap Bucket utilizes **pre-signed URLs**.

```
  ┌──────────┐              1. Request Signed Url             ┌────────────────┐
  │  Client  ├───────────────────────────────────────────────>│  Your Node     │
  │  Browser │                                                │  Backend       │
  │          │<───────────────────────────────────────────────┤ (Express API)  │
  │ (using   │            2. Pre-signed Token URL             └────────────────┘
  │  snap-   │                                                       
  │  bucket) ├────────────────────────────┐                          
  └──────────┘                            │ 3. Stream File Binary directly to S3
                                          ▼                          
                                ┌───────────────────┐                
                                │  AWS S3 Bucket    │                
                                └───────────────────┘                
```

1. **Client Metadata Handshake:** The browser SDK requests permission to upload a file (providing filename, MIME type, and optional subdirectory).
2. **Signed token generation:** Your backend checks client credentials (via optional API Keys or custom API session checks) and generates a short-lived S3 URL using your sealed IAM keys.
3. **Direct Upload:** The browser receives the token and directly PUTs raw binary streams to S3, reporting real-time progress.
