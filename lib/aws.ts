import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";

dotenv.config();

const accessKeyId = process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY;
const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
const region = process.env.NEXT_PUBLIC_AWS_REGION;

// Debug logging (remove in production)
console.log("Environment Variables:", {
  accessKeyId: accessKeyId ? "Set" : "Not Set",
  secretAccessKey: secretAccessKey ? "Set" : "Not Set",
  bucketName,
  region,
});

// Validate environment variables
if (!accessKeyId || !secretAccessKey || !bucketName || !region) {
  throw new Error(
    "Missing required AWS configuration. Please check your environment variables."
  );
}

// Configure AWS S3 Client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  // Add this line for CORS support
  forcePathStyle: true,
});

export async function uploadFileToLightsail(file: File): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  const bucketName = process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
  const region = process.env.NEXT_PUBLIC_AWS_REGION;

  if (!bucketName || !region) {
    throw new Error("Missing AWS bucket configuration");
  }

  try {
    // Generate unique file name
    const fileExtension = file.name.split(".").pop();
    const fileKey = `resumes/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExtension}`;

    // Convert file to array buffer
    const fileBuffer = await file.arrayBuffer();

    // Log key AWS configuration properties
    console.log("AWS Configuration:", {
      region,
      bucketName,
      hasCredentials:
        !!process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID &&
        !!process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY,
      fileSize: file.size,
    });

    // Upload to S3
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: Buffer.from(fileBuffer),
      ContentType: file.type,
      ACL: "public-read",
    });

    await s3Client.send(command);

    // Construct the URL
    const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
    console.log("File uploaded successfully to:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("Error uploading file to Lightsail:", error);
    // Add more detailed error information
    const errorMessage =
      error instanceof Error
        ? `${error.name}: ${error.message}`
        : "Unknown error";

    throw new Error(`Failed to upload file: ${errorMessage}`);
  }
}