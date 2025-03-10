import { NextApiRequest, NextApiResponse } from "next";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import multer from "multer";
import fs from "fs";
import path from "path";

// Setup multer storage configuration for file uploads
const storage = multer.diskStorage({
  destination: "./public/uploads/",
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage }).single("file");

const uploadMiddleware = (req: NextApiRequest, res: NextApiResponse, next: (err?: any) => void) => {
  upload(req as any, res as any, next);
};

// AWS S3 Client Setup
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});
// API Route to handle file uploads
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    try {
      await new Promise<void>((resolve, reject) => {
        uploadMiddleware(req, res, (err) => {
          if (err) return reject(err);
          resolve();
        });
      });

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const filePath = path.join(process.cwd(), "public/uploads", req.file.filename);
      const fileStream = fs.createReadStream(filePath);

      const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: `uploads/${req.file.filename}`,
        Body: fileStream,
        ACL: "bucket-owner-full-control",
      };

      const command = new PutObjectCommand(params);
      await s3Client.send(command);

      // Cleanup: Remove the file from local storage after upload
      fs.unlinkSync(filePath);

      res.status(200).json({ message: "File uploaded successfully" });
    } catch (error) {
      console.error("Upload Error:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
