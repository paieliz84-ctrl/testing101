// Generic S3-compatible Storage (R2, Wasabi, AWS S3, MinIO, etc.)
// 
// This module uses S3-compatible API to interact with various object storage services.
// Default: Cloudflare R2 (configured via wrangler.toml bindings or .env)
// 
// Supported providers:
// - Cloudflare R2 (default): https://r2.cloudflarestorage.com
// - Wasabi: https://s3.wasabisys.com or region-specific endpoint
// - AWS S3: https://s3.<region>.amazonaws.com
// - MinIO: http://localhost:9000 (or your MinIO server)
// - DigitalOcean Spaces: https://<region>.digitaloceanspaces.com
//
// Configuration via .env:
//   S3_ENDPOINT=https://xxx.r2.cloudflarestorage.com
//   S3_BUCKET_NAME=my-bucket
//   S3_ACCESS_KEY_ID=xxx
//   S3_SECRET_ACCESS_KEY=xxx
//   S3_PUBLIC_URL=https://cdn.example.com (optional, for public file URLs)
//   S3_REGION=auto (optional, default: auto)

import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// S3 Configuration
const S3_ENDPOINT = process.env.S3_ENDPOINT || '';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || process.env.R2_BUCKET_NAME || '';
const S3_ACCESS_KEY_ID = process.env.S3_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || '';
const S3_SECRET_ACCESS_KEY = process.env.S3_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || '';
const S3_PUBLIC_URL = process.env.S3_PUBLIC_URL || process.env.R2_PUBLIC_URL || '';
const S3_REGION = process.env.S3_REGION || 'auto';

// R2 Account ID for constructing default R2 endpoint
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || '';

// Create S3 client
function createS3Client(): S3Client | null {
  // Determine endpoint
  let endpoint = S3_ENDPOINT;
  
  // If no endpoint specified but R2_ACCOUNT_ID exists, use R2 default endpoint
  if (!endpoint && R2_ACCOUNT_ID) {
    endpoint = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }
  
  if (!endpoint || !S3_ACCESS_KEY_ID || !S3_SECRET_ACCESS_KEY) {
    return null;
  }

  return new S3Client({
    region: S3_REGION,
    endpoint,
    credentials: {
      accessKeyId: S3_ACCESS_KEY_ID,
      secretAccessKey: S3_SECRET_ACCESS_KEY,
    },
  });
}

// Generate presigned URL for direct upload from client
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 300 // 5 minutes
): Promise<{ url: string; publicUrl: string } | null> {
  const client = createS3Client();
  if (!client || !S3_BUCKET_NAME) {
    return null;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(client, command, { expiresIn });
    
    const publicUrl = S3_PUBLIC_URL 
      ? `${S3_PUBLIC_URL}/${key}`
      : `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${key}`;

    return { url: presignedUrl, publicUrl };
  } catch (err) {
    console.error('Failed to generate presigned URL:', err);
    return null;
  }
}

// Upload file directly via server
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | Blob | string,
  contentType: string
): Promise<{ success: boolean; publicUrl?: string; error?: string }> {
  const client = createS3Client();
  if (!client || !S3_BUCKET_NAME) {
    return { success: false, error: 'S3 storage not configured' };
  }

  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: contentType,
    });

    await client.send(command);

    const publicUrl = S3_PUBLIC_URL 
      ? `${S3_PUBLIC_URL}/${key}`
      : `${S3_ENDPOINT}/${S3_BUCKET_NAME}/${key}`;

    return { success: true, publicUrl };
  } catch (err: any) {
    console.error('Failed to upload file:', err);
    return { success: false, error: err.message };
  }
}

// Delete file from storage
export async function deleteFile(key: string): Promise<{ success: boolean; error?: string }> {
  const client = createS3Client();
  if (!client || !S3_BUCKET_NAME) {
    return { success: false, error: 'S3 storage not configured' };
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    });

    await client.send(command);
    return { success: true };
  } catch (err: any) {
    console.error('Failed to delete file:', err);
    return { success: false, error: err.message };
  }
}

// Check if S3 storage is configured
export function isS3Configured(): boolean {
  const hasEndpoint = S3_ENDPOINT || R2_ACCOUNT_ID;
  return !!(
    hasEndpoint &&
    S3_ACCESS_KEY_ID &&
    S3_SECRET_ACCESS_KEY &&
    S3_BUCKET_NAME
  );
}

// Generate unique file key
export function generateFileKey(prefix: string, filename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '-');
  return `${prefix}/${timestamp}-${random}-${sanitizedFilename}`;
}

// Backward compatibility exports (alias)
export { isS3Configured as isR2Configured };
