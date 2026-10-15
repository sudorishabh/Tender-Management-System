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

// Upload names only contain the characters the upload route keeps, and
// always start with the upload timestamp
const UPLOAD_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/**
 * Splits a key such as "pdf/<name>" into its folder and file name. Returns
 * null unless the key is exactly a known folder plus a plain file name, so
 * ".", "..", backslashes and extra path segments are all rejected.
 */
export function parseUploadKey(
  key: string
): { folder: UploadFolder; name: string } | null {
  const parts = key.split("/");
  if (parts.length !== 2) return null;

  const [folder, name] = parts;
  if (!isUploadFolder(folder) || !UPLOAD_NAME_PATTERN.test(name)) return null;

  return { folder, name };
}

/**
 * Turns a key such as "pdf/<name>" into an absolute path inside UPLOADS_DIR.
 * Throws for any key that parseUploadKey rejects.
 */
export function resolveUploadPath(key: string): string {
  const parsed = parseUploadKey(key);
  if (!parsed) {
    throw new Error("Invalid file path");
  }

  return path.join(UPLOADS_DIR, parsed.folder, parsed.name);
}
