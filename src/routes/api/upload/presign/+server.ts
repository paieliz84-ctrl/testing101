import { json, error, type RequestHandler } from '@sveltejs/kit';
import { generatePresignedUploadUrl, generateFileKey, isS3Configured } from '$lib/storage/s3';
import { z } from 'zod';

const presignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  prefix: z.string().default('uploads'),
});

/**
 * POST /api/upload/presign
 * Generate presigned URL for direct upload to R2
 * For general files (PDF, ZIP, etc) - NOT images
 */
export const POST: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      throw error(401, { message: 'Unauthorized' });
    }
    
    // Check S3 storage configuration
    if (!isS3Configured()) {
      throw error(500, { message: 'Storage not configured' });
    }
    
    const body = await request.json();
    
    // Validate input
    const result = presignSchema.safeParse(body);
    if (!result.success) {
      throw error(400, { message: 'Invalid input' });
    }
    
    const { filename, contentType, prefix } = result.data;
    
    // Validate content type (block dangerous files)
    const allowedTypes = [
      'application/pdf',
      'application/zip',
      'application/json',
      'text/plain',
      'text/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
    ];
    
    if (!allowedTypes.includes(contentType)) {
      throw error(400, { 
        message: 'File type not allowed. Allowed: PDF, ZIP, JSON, TXT, CSV, Excel, Word' 
      });
    }
    
    // Generate unique key
    const key = generateFileKey(`${prefix}/${locals.user.id}`, filename);
    
    // Generate presigned URL (expires in 5 minutes)
    const presignResult = await generatePresignedUploadUrl(key, contentType, 300);
    
    if (!presignResult) {
      throw error(500, { message: 'Failed to generate upload URL' });
    }
    
    return json({
      success: true,
      uploadUrl: presignResult.url,
      publicUrl: presignResult.publicUrl,
      key,
      expiresIn: 300,
    });
    
  } catch (err: any) {
    console.error('Presign error:', err);
    
    if (err.status) throw err;
    
    throw error(500, { message: 'Failed to generate upload URL' });
  }
};
