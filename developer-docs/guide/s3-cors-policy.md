# AWS S3 CORS Configuration

Amazon S3 blocks direct PUT binary streams from external web applications by default to protect against unauthorized bandwidth usage. 

Because `snap-bucket` uploads raw binary files directly from the user's browser, you **must** configure a Cross-Origin Resource Sharing (CORS) policy on your target S3 Bucket.

---

## 🛠️ Step-by-Step Configuration

1. Log in to the [AWS Management Console](https://aws.amazon.com/console/).
2. Open the **Amazon S3** service dashboard.
3. Select your application bucket from the list.
4. Click on the **Permissions** tab at the top.
5. Scroll down to the **Cross-origin resource sharing (CORS)** section.
6. Click **Edit** on the right side.
7. Paste the JSON configuration block below, adjust the allowed origins, and click **Save changes**.

---

## 📄 Recommended CORS Policy

Replace `http://localhost:5173` with your actual local development server address, and add your production domains:

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

---

## Explanation of Properties

* **`AllowedHeaders`**: Allows custom authorization headers or mime content headers (`Content-Type`) during upload handshake.
* **`AllowedMethods`**: Must include `PUT` because `snap-bucket` streams file payloads using `PUT` requests.
* **`AllowedOrigins`**: The exact schemas, subdomains, and ports (e.g. localhost ports) permitted to execute S3 requests. Avoid wildcards (`*`) in production.
* **`ExposeHeaders`**: Exposing `ETag` is standard to confirm successful, complete object writes.
