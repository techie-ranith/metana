// import { NextApiRequest, NextApiResponse } from 'next';
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import { Readable } from 'stream';

// const s3 = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// async function streamToBuffer(stream: Readable): Promise<Buffer> {
//   const chunks: Buffer[] = [];
//   for await (const chunk of stream) {
//     chunks.push(chunk instanceof Buffer ? chunk : Buffer.from(chunk));
//   }
//   return Buffer.concat(chunks);
// }

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method !== 'POST') {
//     return res.status(405).json({ error: 'Method Not Allowed' });
//   }

//   try {
//     const file = req.body.file; // Get file from request body
//     const fileBuffer = Buffer.from(file, 'base64'); // Convert to Buffer

//     const uploadParams = {
//       Bucket: process.env.AWS_BUCKET_NAME!,
//       Key: `uploads/${Date.now()}-${file.name}`,
//       Body: fileBuffer,
//       ContentType: file.type,
//     };

//     await s3.send(new PutObjectCommand(uploadParams));

//     return res.status(200).json({ message: 'File uploaded successfully!' });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return res.status(500).json({ error: 'Upload failed' });
//   }
// }
