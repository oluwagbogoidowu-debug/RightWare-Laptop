/**
 * Cloudinary Upload Utility Service
 * Connects to the secure backend endpoint /api/upload-image
 * uploads images using Cloudinary API credentials with auto-optimization & organization
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
 * Uploads a File object or base64 data URL to Cloudinary via backend signed API endpoint
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

  if (!response.ok) {
    const errData = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(errData.error || `Cloudinary upload failed with status ${response.status}`);
  }

  const data: CloudinaryUploadResponse = await response.json();

  if (!data.success || !data.url) {
    throw new Error(data.error || 'Invalid response from Cloudinary upload service');
  }

  return data.url;
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
