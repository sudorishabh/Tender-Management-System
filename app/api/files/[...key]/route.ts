import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { resolveUploadPath } from "@/lib/server/uploads";
import { getFileAccess } from "@/server/trpc/routers/s3/s3.service";

const CONTENT_TYPES: Record<string, string> = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
};

const notFound = () =>
  NextResponse.json({ error: "File not found" }, { status: 404 });

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> }
) {
  const { key: keyParts } = await params;

  if (!keyParts || keyParts.length === 0) {
    return NextResponse.json({ error: "No file key provided" }, { status: 400 });
  }

  const fileKey = keyParts.join("/");

  // Security: prevent path traversal
  let filePath: string;
  try {
    filePath = resolveUploadPath(fileKey);
  } catch {
    return NextResponse.json({ error: "Invalid file path" }, { status: 400 });
  }

  try {
    const session = await getServerSession(authOptions);
    const viewer = session?.user
      ? { userId: Number(session.user.id), role: session.user.role }
      : null;

    const access = await getFileAccess(fileKey, viewer);
    if (access === "not_found") {
      return notFound();
    }
    if (access === "denied") {
      return viewer
        ? NextResponse.json({ error: "Forbidden" }, { status: 403 })
        : NextResponse.json({ error: "Sign in to view this file" }, { status: 401 });
    }
  } catch (error) {
    console.error("File access check failed:", error);
    return NextResponse.json({ error: "Failed to load file" }, { status: 500 });
  }

  let fileBuffer: Buffer<ArrayBuffer>;
  try {
    fileBuffer = await readFile(filePath);
  } catch {
    return notFound();
  }

  const fileName = keyParts[keyParts.length - 1];
  const ext = path.extname(fileName).toLowerCase();
  const contentType = CONTENT_TYPES[ext] || "application/octet-stream";

  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      // Not cached, so access is checked again on every request
      "Cache-Control": "private, no-store",
    },
  });
}
