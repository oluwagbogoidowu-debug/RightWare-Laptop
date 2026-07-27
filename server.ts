import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary with environment variables or user credentials
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dbkuaoop7';
const apiKey = process.env.CLOUDINARY_API_KEY || '149863477863142';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'gKyEJyKgL7xxFICFdVnhIBw5RTM';

if (process.env.CLOUDINARY_URL) {
  cloudinary.config({
    cloudinary_url: process.env.CLOUDINARY_URL,
    secure: true
  });
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true
  });
}

console.log(`Cloudinary configured for cloud_name: ${cloudName}`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 20mb payload limit for base64 image data
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ limit: '20mb', extended: true }));

  // API Route: Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      cloudinaryConfigured: true,
      cloudName: cloudName
    });
  });

  // API Route: Signed Cloudinary Upload
  app.post('/api/upload-image', async (req, res) => {
    try {
      const { image, folder = 'rightware_laptops', publicId } = req.body;

      if (!image) {
        return res.status(400).json({ error: 'Image file or base64 string is required' });
      }

      const options: Record<string, any> = {
        folder: folder,
        overwrite: true,
        resource_type: 'auto',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' } // Automatic optimization & WebP/AVIF format
        ]
      };

      if (publicId && typeof publicId === 'string' && publicId.trim().length > 0) {
        options.public_id = publicId.trim();
        options.invalidate = true; // Invalidate CDN cache when overwriting
      }

      const uploadResult = await cloudinary.uploader.upload(image, options);

      return res.json({
        success: true,
        url: uploadResult.secure_url,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
        bytes: uploadResult.bytes
      });
    } catch (err: any) {
      console.error('Cloudinary Upload Error:', err);
      return res.status(500).json({
        error: err.message || 'Failed to upload image to Cloudinary'
      });
    }
  });

  // API Route: Generate Signed Upload Parameters (for direct client uploads if preferred)
  app.post('/api/cloudinary-signature', (req, res) => {
    try {
      const { folder = 'rightware_laptops', publicId } = req.body;
      const timestamp = Math.round(new Date().getTime() / 1000);

      const paramsToSign: Record<string, any> = {
        timestamp: timestamp,
        folder: folder
      };

      if (publicId) {
        paramsToSign.public_id = publicId;
        paramsToSign.overwrite = true;
      }

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        apiSecret
      );

      return res.json({
        signature,
        timestamp,
        cloudName,
        apiKey,
        folder
      });
    } catch (err: any) {
      console.error('Cloudinary Signature Error:', err);
      return res.status(500).json({ error: 'Failed to generate Cloudinary upload signature' });
    }
  });

  // API Route: Delete Image from Cloudinary
  app.post('/api/delete-image', async (req, res) => {
    try {
      const { publicId } = req.body;
      if (!publicId) {
        return res.status(400).json({ error: 'publicId is required' });
      }

      const result = await cloudinary.uploader.destroy(publicId, { invalidate: true });
      return res.json({ success: true, result });
    } catch (err: any) {
      console.error('Cloudinary Delete Error:', err);
      return res.status(500).json({ error: 'Failed to delete image from Cloudinary' });
    }
  });

  // Vite middleware in dev mode; static serve in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Server startup error:', err);
});
