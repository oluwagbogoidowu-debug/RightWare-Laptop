import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_CLOUD_NAME = 'dbkuaoop7';
const DEFAULT_API_KEY = '149863477863142';
const DEFAULT_API_SECRET = 'gKyEJyKgL7xxFICFdVnhIBw5RTM';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/')) {
          return next();
        }

        const cloudName = process.env.CLOUDINARY_CLOUD_NAME || DEFAULT_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY || DEFAULT_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET || DEFAULT_API_SECRET;

        cloudinary.config({
          cloud_name: cloudName,
          api_key: apiKey,
          api_secret: apiSecret,
          secure: true
        });

        // /api/health
        if (req.url.startsWith('/api/health')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            status: 'ok',
            cloudinaryConfigured: true,
            cloudName
          }));
          return;
        }

        // /api/sign-upload
        if (req.url.startsWith('/api/sign-upload')) {
          try {
            const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
            const folder = urlObj.searchParams.get('folder') || 'rightware_laptops';
            const publicId = urlObj.searchParams.get('public_id') || undefined;
            const timestamp = Math.round(Date.now() / 1000);

            const paramsToSign: Record<string, any> = { timestamp };
            if (folder) paramsToSign.folder = folder;
            if (publicId) {
              paramsToSign.public_id = publicId;
              paramsToSign.overwrite = true;
            }

            const signature = cloudinary.utils.api_sign_request(paramsToSign, apiSecret);

            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
              timestamp,
              signature,
              apiKey,
              cloudName,
              folder
            }));
            return;
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Failed to sign upload request' }));
            return;
          }
        }

        // /api/upload-image
        if (req.url.startsWith('/api/upload-image') && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk) => { body += chunk; });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body || '{}');
              const { image, folder = 'rightware_laptops', publicId } = data;

              if (!image) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Image data is required' }));
                return;
              }

              const options: Record<string, any> = {
                folder: folder || 'rightware_laptops',
                resource_type: 'auto'
              };

              if (publicId) {
                options.public_id = publicId;
                options.overwrite = true;
                options.invalidate = true;
              }

              const uploadResult = await cloudinary.uploader.upload(image, options);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                url: uploadResult.secure_url,
                public_id: uploadResult.public_id,
                format: uploadResult.format,
                width: uploadResult.width,
                height: uploadResult.height,
                bytes: uploadResult.bytes
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message || 'Upload failed' }));
            }
          });
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
