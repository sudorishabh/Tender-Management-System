import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  MAX_UPLOAD_BYTES,
  isAllowedFileType,
  isUploadFolder,
  resolveUploadPath,
} from "@/lib/server/uploads";

// Multipart boundaries and headers add a little on top of the file itself
const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 1024 * 1024;

const badRequest = (error: string, status = 400) =>
  NextResponse.json({ success: false, error }, { status });

export async function POST(req: NextRequest) {
  // Reject oversized bodies before reading them into memory
  if (Number(req.headers.get("content-length")) > MAX_REQUEST_BYTES) {
    return badRequest("File is too large", 413);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const folder = formData.get("folder") ?? "pdf";

    if (!(file instanceof File)) {
      return badRequest("No file provided");
    }

    if (typeof folder !== "string" || !isUploadFolder(folder)) {
      return badRequest("Invalid upload folder");
    }

    if (file.size === 0) {
      return badRequest("File is empty");
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return badRequest("File is too large", 413);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (!isAllowedFileType(folder, file.name, buffer)) {
      return badRequest("Unsupported file type");
    }

    const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    // The name is the only secret protecting a file until a record uses it,
    // so it needs a cryptographically random part
    const uniqueKey = `${Date.now()}-${randomBytes(8).toString("hex")}-${sanitizedOriginalName}`;

    const filePath = resolveUploadPath(`${folder}/${uniqueKey}`);
    await mkdir(path.dirname(filePath), { recursive: true });
    // "wx" fails instead of overwriting if the key somehow already exists
    await writeFile(filePath, buffer, { flag: "wx" });

    return NextResponse.json({ success: true, key: uniqueKey });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 },
    );
  }
}
