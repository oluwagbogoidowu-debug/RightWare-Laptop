import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Cloudinary with valid credentials or fallback to user credentials
const DEFAULT_CLOUD_NAME = 'dbkuaoop7';
const DEFAULT_API_KEY = '149863477863142';
const DEFAULT_API_SECRET = 'gKyEJyKgL7xxFICFdVnhIBw5RTM';

function getCloudinaryCredentials() {
  const envUrl = process.env.CLOUDINARY_URL;
  if (envUrl && envUrl.startsWith('cloudinary://') && !envUrl.includes('<')) {
    return {
      cloudName: DEFAULT_CLOUD_NAME,
      apiKey: DEFAULT_API_KEY,
      apiSecret: DEFAULT_API_SECRET,
      config: { cloudinary_url: envUrl, secure: true }
    };
  }

  const cloudName = (process.env.CLOUDINARY_CLOUD_NAME && !process.env.CLOUDINARY_CLOUD_NAME.includes('<'))
    ? process.env.CLOUDINARY_CLOUD_NAME
    : DEFAULT_CLOUD_NAME;

  const apiKey = (process.env.CLOUDINARY_API_KEY && !process.env.CLOUDINARY_API_KEY.includes('<'))
    ? process.env.CLOUDINARY_API_KEY
    : DEFAULT_API_KEY;

  const apiSecret = (process.env.CLOUDINARY_API_SECRET && !process.env.CLOUDINARY_API_SECRET.includes('<'))
    ? process.env.CLOUDINARY_API_SECRET
    : DEFAULT_API_SECRET;

  return {
    cloudName,
    apiKey,
    apiSecret,
    config: {
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true
    }
  };
}

const creds = getCloudinaryCredentials();
cloudinary.config(creds.config);

console.log(`Cloudinary configured for cloud_name: ${creds.cloudName}`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Body parser with 50mb payload limit for high-res images
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // API Route: Health Check
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      cloudinaryConfigured: true,
      cloudName: creds.cloudName
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
        folder: folder || 'rightware_laptops',
        resource_type: 'auto'
      };

      if (publicId && typeof publicId === 'string' && publicId.trim().length > 0) {
        options.public_id = publicId.trim();
        options.overwrite = true;
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
      console.error('Cloudinary Upload Error Details:', err);
      return res.status(500).json({
        error: err.message || (typeof err === 'string' ? err : 'Failed to upload image to Cloudinary')
      });
    }
  });

  // API Route: Sign Upload Signature (GET & POST)
  app.get('/api/sign-upload', (req, res) => {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const folder = (req.query.folder as string) || 'rightware_laptops';
      const publicId = req.query.public_id as string;

      const paramsToSign: Record<string, any> = { timestamp };
      if (folder) paramsToSign.folder = folder;
      if (publicId) {
        paramsToSign.public_id = publicId;
        paramsToSign.overwrite = true;
      }

      const activeSecret = process.env.CLOUDINARY_API_SECRET || creds.apiSecret;
      const activeApiKey = process.env.CLOUDINARY_API_KEY || creds.apiKey;
      const activeCloudName = process.env.CLOUDINARY_CLOUD_NAME || creds.cloudName;

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        activeSecret
      );

      return res.json({
        timestamp,
        signature,
        apiKey: activeApiKey,
        cloudName: activeCloudName,
        folder
      });
    } catch (err: any) {
      console.error('Sign Upload Error:', err);
      return res.status(500).json({ error: 'Failed to sign upload request' });
    }
  });

  app.post('/api/sign-upload', (req, res) => {
    try {
      const timestamp = Math.round(Date.now() / 1000);
      const { folder = 'rightware_laptops', publicId } = req.body || {};

      const paramsToSign: Record<string, any> = { timestamp };
      if (folder) paramsToSign.folder = folder;
      if (publicId) {
        paramsToSign.public_id = publicId;
        paramsToSign.overwrite = true;
      }

      const activeSecret = process.env.CLOUDINARY_API_SECRET || creds.apiSecret;
      const activeApiKey = process.env.CLOUDINARY_API_KEY || creds.apiKey;
      const activeCloudName = process.env.CLOUDINARY_CLOUD_NAME || creds.cloudName;

      const signature = cloudinary.utils.api_sign_request(
        paramsToSign,
        activeSecret
      );

      return res.json({
        timestamp,
        signature,
        apiKey: activeApiKey,
        cloudName: activeCloudName,
        folder
      });
    } catch (err: any) {
      console.error('Sign Upload Error:', err);
      return res.status(500).json({ error: 'Failed to sign upload request' });
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
