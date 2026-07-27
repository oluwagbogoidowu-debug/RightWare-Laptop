/**
 * Cloudinary Upload Utility Service
 * Provides multi-tier upload with backend endpoints, direct Cloudinary APIs, and compressed Data URL fallback
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
 * Uploads a File object or base64 data URL to Cloudinary with multi-tier fallback
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

  let base64Data: string | null = null;
  if (typeof imageInput === 'string') {
    base64Data = imageInput;
  }

  // Strategy 1: Direct backend base64 upload endpoint (/api/upload-image)
  try {
    if (!base64Data) {
      base64Data = await fileToBase64(imageInput as File);
    }

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: base64Data,
        folder,
        publicId
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.url) {
        return data.url;
      }
    }
  } catch (backendErr) {
    console.warn('Strategy 1 (/api/upload-image) failed:', backendErr);
  }

  // Strategy 2: Direct signed upload using /api/sign-upload
  try {
    const url = `/api/sign-upload?folder=${encodeURIComponent(folder)}${publicId ? `&public_id=${encodeURIComponent(publicId)}` : ''}`;
    let sigRes = await fetch(url);
    
    if (!sigRes.ok) {
      sigRes = await fetch('/api/sign-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder, publicId })
      });
    }

    if (sigRes.ok) {
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
      formData.append('folder', sigData.folder || folder);

      if (publicId) {
        formData.append('public_id', publicId);
        formData.append('overwrite', 'true');
      }

      const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName || 'dbkuaoop7'}/image/upload`;
      const directRes = await fetch(cloudinaryUrl, {
        method: 'POST',
        body: formData
      });

      if (directRes.ok) {
        const directData = await directRes.json();
        if (directData.secure_url) {
          return directData.secure_url;
        }
      }
    }
  } catch (sigErr) {
    console.warn('Strategy 2 (/api/sign-upload) failed:', sigErr);
  }

  // Strategy 3: Client-side compressed WebP / JPEG Data URL (Fail-safe)
  try {
    if (typeof imageInput !== 'string') {
      const compressedUrl = await compressImageToDataUrl(imageInput as File, 1200, 0.82);
      return compressedUrl;
    } else if (base64Data) {
      return base64Data;
    }
  } catch (compressErr) {
    console.warn('Strategy 3 compression failed:', compressErr);
  }

  if (base64Data) {
    return base64Data;
  }

  throw new Error('Could not process image upload');
}

/**
 * Compress image using browser canvas before saving
 */
export async function compressImageToDataUrl(file: File, maxWidth = 1200, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => resolve(e.target?.result as string);
    };
    reader.onerror = (err) => reject(err);
  });
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


