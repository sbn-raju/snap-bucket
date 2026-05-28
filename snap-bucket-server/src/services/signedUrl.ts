import {
  PutObjectCommand
} from "@aws-sdk/client-s3";

import { getSignedUrl } from
  "@aws-sdk/s3-request-presigner";

import { S3Client } from
  "@aws-sdk/client-s3";

interface Params {
  s3: S3Client;
  bucket: string;
  fileName: string;
  contentType: string;
  folder?: string;
  region: string;
}

export const generateSignedUrl =
  async ({
    s3,
    bucket,
    fileName,
    contentType,
    folder,
    region
  }: Params) => {

    const key = folder
      ? `${folder}/${Date.now()}-${fileName}`
      : `${Date.now()}-${fileName}`;

    const command =
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType:
          contentType
      });

    const uploadUrl =
      await getSignedUrl(
        s3,
        command,
        {
          expiresIn: 60
        }
      );

    const fileUrl =
      `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

    return {
      uploadUrl,
      fileUrl
    };
  };