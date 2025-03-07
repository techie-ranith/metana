import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
dotenv.config();

console.log("AWS_ACCESS_KEY_ID:", process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID);
console.log("AWS_SECRET_ACCESS_KEY:", process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY);
console.log("AWS_BUCKET_NAME:", process.env.NEXT_PUBLIC_AWS_BUCKET_NAME);
console.log("AWS_REGION:", process.env.NEXT_PUBLIC_AWS_REGION);

const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const bucketName = process.env.AWS_BUCKET_NAME!;
const region = process.env.AWS_REGION!;

console.log("\n AWS_ACCESS_KEY_ID:", accessKeyId);
console.log("AWS_SECRET_ACCESS_KEY:", secretAccessKey);
console.log("AWS_BUCKET_NAME:", bucketName);
console.log("AWS_REGION:", region);

// Validate environment variables
if (!accessKeyId || !secretAccessKey || !bucketName || !region) {
  throw new Error("Missing required variables.");
}

// Configure AWS SDK v3 S3 Client
const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export async function uploadFileToLightsail(file: File): Promise<string> {
  const fileKey = `resumes/${Date.now()}-${file.name}`; // Unique filename

  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: await file.arrayBuffer(), // Convert file to ArrayBuffer
    ACL: "public-read", // Makes file publicly accessible
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return `https://${bucketName}.s3.${region}.amazonaws.com/${fileKey}`;
  } catch (error) {
    console.error("Lightsail Storage Upload Error:", error);
    throw new Error("Failed to upload file to Lightsail.");
  }
}
