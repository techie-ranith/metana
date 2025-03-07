import AWS from "aws-sdk";
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

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region,
  endpoint: `https://s3.${region}.amazonaws.com`, // Add explicit endpoint
  signatureVersion: "v4", // Add this for newer regions
});

export async function uploadFileToLightsail(file: File): Promise<string> {
  if (!file) {
    throw new Error("No file provided");
  }

  // Convert File to Buffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileKey = `resumes/${Date.now()}-${file.name}`; // Unique filename

  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: buffer,
    ContentType: file.type,
    ACL: "public-read",
  };

  try {
    const uploadResponse = await s3.upload(params).promise();
    console.log("Upload successful:", uploadResponse.Location);
    return uploadResponse.Location;
  } catch (error) {
    console.error("AWS S3 Upload Error:", error);
    throw error; // Throw the actual error for better debugging
  }
}
