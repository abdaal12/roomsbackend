const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:         'roomrent/properties',   // folder in your Cloudinary account
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
    ],
  },
});

// Multer upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
});

/**
 * Delete an image from Cloudinary by its URL
 * Extracts the public_id from the URL and destroys it
 */
const deleteFromCloudinary = async (imageUrl) => {
  try {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/<cloud>/image/upload/v12345/roomrent/properties/<id>.jpg
    const parts = imageUrl.split('/');
    const filenameWithExt = parts[parts.length - 1];
    const filename = filenameWithExt.split('.')[0];
    const folder = parts[parts.length - 2];
    const parentFolder = parts[parts.length - 3];
    const publicId = `${parentFolder}/${folder}/${filename}`;

    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
};

module.exports = { upload, cloudinary, deleteFromCloudinary };