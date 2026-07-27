/**
 * Cloudinary Upload Utility Service
 * Uses backend endpoint /api/upload-image with fallback to direct signed client upload
 */

export interface CloudinaryUploadResponse {
  success: boolean;
  url: string;
  public_id: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  error?: string;
}

/**
 * Uploads a File object or base64 data URL to Cloudinary
 */
export async function uploadToCloudinary(
  imageInput: File | string,
  options?: {
    folder?: string;
    publicId?: string;
    onProgress?: (percent: number) => void;
  }
): Promise<string> {
  const folder = options?.folder || 'rightware_laptops';
  const publicId = options?.publicId;

  // If already an http/https image URL (like Unsplash), return directly
  if (typeof imageInput === 'string' && (imageInput.startsWith('http://') || imageInput.startsWith('https://'))) {
    if (!imageInput.includes('base64')) {
      return imageInput;
    }
  }

  // Strategy 1: Attempt direct backend upload endpoint
  try {
    let base64Data: string;
    if (typeof imageInput === 'string') {
      base64Data = imageInput;
    } else {
      base64Data = await fileToBase64(imageInput);
    }

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: base64Data,
        folder,
        publicId
      })
    });

    if (response.ok) {
      const data: CloudinaryUploadResponse = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (backendErr) {
    console.warn('Backend Cloudinary upload endpoint failed, trying direct signed upload:', backendErr);
  }

  // Strategy 2: Direct signed upload to Cloudinary Edge API
  try {
    const sigRes = await fetch('/api/cloudinary-signature', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ folder, publicId })
    });

    if (!sigRes.ok) {
      throw new Error(`Failed to obtain Cloudinary upload signature (status ${sigRes.status})`);
    }

    const sigData = await sigRes.json();
    const formData = new FormData();

    if (typeof imageInput === 'string') {
      formData.append('file', imageInput);
    } else {
      formData.append('file', imageInput);
    }

    formData.append('api_key', sigData.apiKey);
    formData.append('timestamp', sigData.timestamp.toString());
    formData.append('signature', sigData.signature);
    formData.append('folder', sigData.folder);

    if (publicId) {
      formData.append('public_id', publicId);
      formData.append('overwrite', 'true');
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/image/upload`;
    const directRes = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: formData
    });

    if (!directRes.ok) {
      const errorJson = await directRes.json().catch(() => ({}));
      throw new Error(errorJson.error?.message || `Direct Cloudinary upload failed (${directRes.status})`);
    }

    const directData = await directRes.json();
    if (directData.secure_url) {
      return directData.secure_url;
    }
  } catch (directErr: any) {
    console.error('Direct Cloudinary upload error:', directErr);
    throw new Error(directErr.message || 'Failed to upload image to Cloudinary');
  }

  throw new Error('Cloudinary upload failed via all strategies.');
}

/**
 * Utility to convert File to base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

