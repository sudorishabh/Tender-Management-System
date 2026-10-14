import path from "path";

/**
 * Uploaded files live outside the project folder, so a fresh clone, a
 * redeploy or `git clean` never touches them. Set UPLOADS_DIR to an absolute
 * path in production; otherwise an "eTender-uploads" folder next to the
 * project folder is used.
 */
export const UPLOADS_DIR = path.resolve(
  process.env.UPLOADS_DIR ||
    path.join(/* turbopackIgnore: true */ process.cwd(), "..", "eTender-uploads")
);

// Matches the largest client-side limit (contract documents, 60 MB)
export const MAX_UPLOAD_BYTES = 60 * 1024 * 1024;

const FOLDER_EXTENSIONS = {
  pdf: [".pdf"],
  images: [".jpg", ".jpeg", ".png", ".gif", ".webp"],
} as const;

export type UploadFolder = keyof typeof FOLDER_EXTENSIONS;

export const isUploadFolder = (folder: string): folder is UploadFolder =>
  Object.prototype.hasOwnProperty.call(FOLDER_EXTENSIONS, folder);

/**
 * Checks the file name's extension against the folder, and for PDFs that the
 * content really is a PDF (the spec allows the header within the first 1 KB).
 */
export function isAllowedFileType(
  folder: UploadFolder,
  fileName: string,
  content: Buffer
): boolean {
  const ext = path.extname(fileName).toLowerCase();
  if (!(FOLDER_EXTENSIONS[folder] as readonly string[]).includes(ext)) {
    return false;
  }
  if (folder === "pdf") {
    return content.subarray(0, 1024).includes("%PDF-");
  }
  return true;
}

/**
 * Turns a stored key such as "pdf/<name>" into an absolute path inside
 * UPLOADS_DIR. Throws for keys that escape the uploads folder or point
 * outside one of the known sub-folders.
 */
export function resolveUploadPath(key: string): string {
  if (key.includes("\0")) {
    throw new Error("Invalid file path");
  }

  const filePath = path.resolve(UPLOADS_DIR, key);
  const segments = path.relative(UPLOADS_DIR, filePath).split(path.sep);

  if (segments.length < 2 || !isUploadFolder(segments[0])) {
    throw new Error("Invalid file path");
  }

  return filePath;
}
