import { json, error, type RequestHandler } from '@sveltejs/kit';
import { uploadFile, isS3Configured } from '$lib/storage/s3';
import { convertToWebP, createAvatar, validateImageFile } from '$lib/image/convert';

/**
 * POST /api/upload/image
 * Upload image, convert to WebP, and store in S3-compatible storage (R2, Wasabi, etc.)
 * For avatars and images
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
    
    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string || 'general'; // 'avatar' or 'general'
    
    if (!file) {
      throw error(400, { message: 'No file provided' });
    }
    
    // Validate image file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw error(400, { message: validation.error || 'Invalid image file' });
    }
    
    // Process image based on type
    let processedBlob: Blob;
    let filename: string;
    
    if (type === 'avatar') {
      // Create square avatar (256x256)
      processedBlob = await createAvatar(file, 256);
      filename = `avatars/${locals.user.id}/avatar.webp`;
    } else {
      // General image - convert to WebP with max dimensions
      processedBlob = await convertToWebP(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
      });
      
      // Generate unique filename
      const timestamp = Date.now();
      const random = Math.random().toString(36).substring(2, 8);
      filename = `images/${locals.user.id}/${timestamp}-${random}.webp`;
    }
    
    // Convert blob to array buffer for upload
    const arrayBuffer = await processedBlob.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Upload to S3 storage
    const uploadResult = await uploadFile(
      filename,
      uint8Array,
      'image/webp'
    );
    
    if (!uploadResult.success) {
      throw error(500, { 
        message: uploadResult.error || 'Failed to upload image' 
      });
    }
    
    return json({
      success: true,
      url: uploadResult.publicUrl,
      filename,
      type: 'image/webp',
      size: processedBlob.size,
    });
    
  } catch (err: any) {
    console.error('Image upload error:', err);
    
    if (err.status) throw err;
    
    throw error(500, { message: 'Failed to upload image' });
  }
};

/**
 * DELETE /api/upload/image
 * Delete an image from S3 storage
 */
export const DELETE: RequestHandler = async ({ request, locals }) => {
  try {
    // Check authentication
    if (!locals.user) {
      throw error(401, { message: 'Unauthorized' });
    }
    
    const body = await request.json() as { key?: string };
    const { key } = body;
    
    if (!key) {
      throw error(400, { message: 'Image key required' });
    }
    
    // Security check: ensure user can only delete their own images
    if (!key.includes(`/avatars/${locals.user.id}/`) && !key.includes(`/images/${locals.user.id}/`)) {
      throw error(403, { message: 'Not authorized to delete this image' });
    }
    
    // Delete from storage
    const { deleteFile } = await import('$lib/storage/s3');
    const result = await deleteFile(key);
    
    if (!result.success) {
      throw error(500, { message: result.error || 'Failed to delete image' });
    }
    
    return json({
      success: true,
      message: 'Image deleted successfully',
    });
    
  } catch (err: any) {
    console.error('Image delete error:', err);
    
    if (err.status) throw err;
    
    throw error(500, { message: 'Failed to delete image' });
  }
};
