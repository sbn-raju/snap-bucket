import axios from "axios";
import { getConfig } from "./config";
import { SignedUrlResponse } from "./types";

export const getSignedUrl = async (
  file: File,
  folder?: string
): Promise<SignedUrlResponse> => {
  const config = getConfig();

  const response = await axios.post(
    config.endpoint,
    {
      fileName: file.name,
      contentType: file.type,
      folder
    },
    {
      headers: {
        Authorization: config.apiKey || ""
      }
    }
  );

  return response.data;
};