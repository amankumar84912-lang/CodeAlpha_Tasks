import { v2 as cloudinary } from 'cloudinary';

// Configured lazily to prevent ESM import hoisting timing issues
const ensureConfig = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

/**
 * Uploads an image buffer (from multer memoryStorage) to Cloudinary.
 *
 * @param {Buffer} buffer - Image file buffer
 * @param {string} folder - Cloudinary folder path (e.g. 'connectsphere/avatars')
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export const uploadImage = (buffer, folder = 'connectsphere') => {
  ensureConfig();
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' },
          { width: 1200, crop: 'limit' },
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
};

/**
 * Deletes an image from Cloudinary by its public ID.
 * Safe to call with null/undefined — returns null immediately.
 *
 * @param {string|null} publicId
 */
export const deleteImage = async (publicId) => {
  if (!publicId) return null;
  ensureConfig();
  return cloudinary.uploader.destroy(publicId);
};
