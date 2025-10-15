// app/api/upload/route.ts
import { NextResponse } from "next/server";
import { uploadFileToS3, ALLOWED_FILE_TYPES, getFolderForFileType } from "@/lib/s3";
import { requireAdmin, unauthorizedResponse, forbiddenResponse } from "@/lib/auth-helpers";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  // Check authentication
  const authCheck = await requireAdmin(req);
  if ("error" in authCheck) {
    return authCheck.status === 401
      ? unauthorizedResponse(authCheck.error)
      : forbiddenResponse(authCheck.error);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const fileType = formData.get("fileType") as string; // 'image', 'datasheet', 'ies', 'certification'

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!fileType) {
      return NextResponse.json({ error: "File type not specified" }, { status: 400 });
    }

    // Validate file type
    let allowedTypes: string[] = [];
    switch (fileType) {
      case "image":
        allowedTypes = ALLOWED_FILE_TYPES.images;
        break;
      case "datasheet":
        allowedTypes = ALLOWED_FILE_TYPES.datasheets;
        break;
      case "ies":
        allowedTypes = ALLOWED_FILE_TYPES.iesFiles;
        break;
      case "certification":
        allowedTypes = ALLOWED_FILE_TYPES.certifications;
        break;
      default:
        return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Check if file type is allowed
    const isValidType = allowedTypes.some((type) =>
      file.type.toLowerCase().includes(type.toLowerCase()) || file.name.toLowerCase().endsWith(type)
    );

    if (!isValidType) {
      return NextResponse.json(
        {
          error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
        },
        { status: 400 }
      );
    }

    // Check file size (10MB limit)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Determine folder based on file type
    const folder = getFolderForFileType(fileType);

    // Upload to S3
    const fileUrl = await uploadFileToS3({
      file: buffer,
      fileName: file.name,
      contentType: file.type,
      folder,
    });

    return NextResponse.json({
      success: true,
      url: fileUrl,
      fileName: file.name,
      fileType,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
