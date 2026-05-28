import { getSignedUrl } from "./api";
import { UploadError } from "./errors";
import { UploadFileOptions } from "./types";
import { xhrUpload } from "./utils/xhrUpload";

export const uploadFile = async ({
  file,
  folder,
  onProgress
}: UploadFileOptions): Promise<string> => {
  try {
    const { uploadUrl, fileUrl } =
      await getSignedUrl(file, folder);

    await xhrUpload(
      uploadUrl,
      file,
      onProgress
    );

    return fileUrl;
  } catch (error) {
    throw new UploadError(
      "File upload failed"
    );
  }
};