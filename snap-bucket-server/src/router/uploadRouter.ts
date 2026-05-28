import { Router } from "express";

import { createS3Client } from "../config/s3";

import { generateSignedUrl } from "../services/signedUrl";

import { ConnectifyConfig, SignedUrlBody } from "../type";

export const createUploadRouter = (config: ConnectifyConfig) => {
  const router = Router();

  const s3 = createS3Client(config);

  router.post("/", async (req, res) => {
    try {
      const body = req.body as SignedUrlBody;

      if (!body) {
        return res.status(400).json({
          message: "Request body missing.",
        });
      }

      if (!body.fileName) {
        return res.status(400).json({
          message: "fileName missing",
        });
      }

      if (!body.contentType) {
        return res.status(400).json({
          message: "contentType missing",
        });
      }

      const response = await generateSignedUrl({
        s3,
        bucket: config.bucket,
        region: config.region,
        fileName: body.fileName,
        contentType: body.contentType,
        folder: body.folder,
      });

      return res.json(response);
    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Failed to generate signed URL",
      });
    }
  });

  return router;
};
