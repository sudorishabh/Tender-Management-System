import { unlink } from "fs/promises";
import { resolveUploadPath } from "@/lib/server/uploads";

/**
 * Returns a local URL to serve the file via /api/files/
 */
export async function getDownloadUrl(fileKey: string): Promise<string> {
  return `/api/files/${fileKey}`;
}

/**
 * Deletes a file from the local uploads folder.
 */
export async function deleteFile(fileKey: string): Promise<void> {
  await unlink(resolveUploadPath(fileKey));
}

/**
 * Deletes multiple files from the local uploads folder.
 */
export async function deleteFiles(fileKeys: string[]): Promise<void> {
  await Promise.all(fileKeys.map((key) => deleteFile(key)));
}
