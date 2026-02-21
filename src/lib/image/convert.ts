/**
 * Image processing utilities using Canvas API
 * Works in Cloudflare Workers environment
 */

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for WebP
}

/**
 * Convert an image file to WebP format
 * Uses Canvas API which works in Cloudflare Workers
 */
export async function convertToWebP(
  file: File | Blob,
  options: ImageProcessingOptions = {}
): Promise<Blob> {
  const { maxWidth = 1024, maxHeight = 1024, quality = 0.85 } = options;

  // Read file as data URL
  const dataUrl = await blobToDataUrl(file);
  
  // Create image bitmap (works in Workers)
  const imageBitmap = await createImageBitmap(file);
  
  // Calculate new dimensions while maintaining aspect ratio
  let { width, height } = imageBitmap;
  
  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.floor(width * ratio);
    height = Math.floor(height * ratio);
  }
  
  // Create offscreen canvas (Cloudflare Workers compatible)
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw image to canvas
  ctx.drawImage(imageBitmap, 0, 0, width, height);
  
  // Convert to WebP blob
  const webpBlob = await canvas.convertToBlob({
    type: 'image/webp',
    quality,
  });
  
  // Clean up
  imageBitmap.close();
  
  return webpBlob;
}

/**
 * Convert Blob to data URL
 */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.' 
    };
  }
  
  // Check file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    return { 
      valid: false, 
      error: 'File too large. Maximum size is 5MB.' 
    };
  }
  
  return { valid: true };
}

/**
 * Generate a unique filename for avatar
 */
export function generateAvatarFilename(userId: string): string {
  const timestamp = Date.now();
  return `avatars/${userId}/${timestamp}.webp`;
}

/**
 * Get file extension from mime type
 */
export function getExtensionFromMimeType(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };
  return map[mimeType] || 'bin';
}

/**
 * Resize image for avatar (square crop, centered)
 */
export async function createAvatar(
  file: File | Blob,
  size: number = 256
): Promise<Blob> {
  const imageBitmap = await createImageBitmap(file);
  
  // Calculate crop dimensions (center crop to square)
  let { width, height } = imageBitmap;
  let sx = 0, sy = 0, sw = width, sh = height;
  
  if (width > height) {
    // Landscape: crop sides
    sw = height;
    sx = (width - height) / 2;
  } else if (height > width) {
    // Portrait: crop top/bottom
    sh = width;
    sy = (height - width) / 2;
  }
  
  // Create square canvas
  const canvas = new OffscreenCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }
  
  // Draw cropped image
  ctx.drawImage(
    imageBitmap,
    sx, sy, sw, sh,  // Source crop
    0, 0, size, size  // Destination
  );
  
  const webpBlob = await canvas.convertToBlob({
    type: 'image/webp',
    quality: 0.9,
  });
  
  imageBitmap.close();
  
  return webpBlob;
}
