import AWS from "aws-sdk";
import dotenv from 'dotenv';
dotenv.config();

console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID);
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY);
console.log('AWS_BUCKET_NAME:', process.env.AWS_BUCKET_NAME);
console.log('AWS_REGION:', process.env.AWS_REGION);


const accessKeyId = process.env.AWS_ACCESS_KEY_ID!;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;
const bucketName = process.env.AWS_BUCKET_NAME!;
const region = process.env.AWS_REGION!;

// Validate environment variables
if (!accessKeyId || !secretAccessKey || !bucketName || !region) {
  throw new Error("Missing required environment variables.");
}

// Configure AWS SDK
const s3 = new AWS.S3({
  accessKeyId,
  secretAccessKey,
  region,
});

export async function uploadFileToLightsail(file: File): Promise<string> {
  const fileKey = `resumes/${Date.now()}-${file.name}`; // Unique filename

  const params = {
    Bucket: bucketName,
    Key: fileKey,
    Body: file,
    ACL: "public-read", // Makes file publicly accessible
  };

  try {
    const uploadResponse = await s3.upload(params).promise();
    return uploadResponse.Location; // Public URL of the uploaded file
  } catch (error) {
    console.error("Lightsail Storage Upload Error:", error);
    throw new Error("Failed to upload file to Lightsail.");
  }
}
