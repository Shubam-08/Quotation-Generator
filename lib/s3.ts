// lib/s3.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "";

export interface UploadFileParams {
  file: Buffer;
  fileName: string;
  contentType: string;
  folder?: string; // Optional folder path in S3 (e.g., 'datasheets', 'ies-files')
}

/**
 * Upload a file to S3 and return the public URL
 */
export async function uploadFileToS3({
  file,
  fileName,
  contentType,
  folder = "uploads",
}: UploadFileParams): Promise<string> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured");
  }

  // Sanitize filename and create unique key
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = folder ? `${folder}/${timestamp}-${sanitizedFileName}` : `${timestamp}-${sanitizedFileName}`;

  const uploadParams = {
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: contentType,
    // Make files publicly readable (adjust based on your security requirements)
    ACL: "public-read" as const,
  };

  try {
    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    await upload.done();

    // Construct the public URL
    const region = process.env.AWS_REGION || "us-east-1";
    const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
    
    return url;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload file to S3");
  }
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(fileUrl: string): Promise<void> {
  if (!BUCKET_NAME) {
    throw new Error("AWS_S3_BUCKET_NAME is not configured");
  }

  try {
    // Extract the key from the URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting from S3:", error);
    throw new Error("Failed to delete file from S3");
  }
}

/**
 * Get the folder name based on file type
 */
export function getFolderForFileType(fileType: string): string {
  const type = fileType.toLowerCase();
  
  if (type.includes("image")) {
    return "product-images";
  } else if (type.includes("pdf") || type.includes("datasheet")) {
    return "datasheets";
  } else if (type.includes("ies")) {
    return "ies-files";
  } else if (type === "bisapproval") {
    return "bis-approval";
  } else if (type === "isocertificate") {
    return "iso-certificate";
  } else if (type.includes("certification") || type.includes("certificate")) {
    return "certifications";
  }
  
  return "uploads";
}

/**
 * Validate file type and size
 */
export function validateFile(
  file: File,
  allowedTypes: string[],
  maxSizeMB: number = 10
): { valid: boolean; error?: string } {
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  // Check file type
  const fileType = file.type.toLowerCase();
  const isValidType = allowedTypes.some((type) => fileType.includes(type.toLowerCase()));
  
  if (!isValidType) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
}

// Allowed file types for different categories
export const ALLOWED_FILE_TYPES = {
  images: ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"],
  datasheets: ["application/pdf"],
  iesFiles: [".ies", "text/plain", "application/octet-stream"], // IES files are often text-based
  certifications: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
  bisApproval: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
  isoCertificate: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
};
