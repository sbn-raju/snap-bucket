import { S3Client } from
  "@aws-sdk/client-s3";

import { ConnectifyConfig }
  from "../type";

export const createS3Client = (
  config: ConnectifyConfig
) => {
  return new S3Client({
    region: config.region,

    credentials: {
      accessKeyId:
        config.accessKeyId,

      secretAccessKey:
        config.secretAccessKey
    }
  });
};