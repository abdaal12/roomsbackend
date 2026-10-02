const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder:          'roomrent/properties',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation:  [
      { width: 1200, height: 800, crop: 'limit', quality: 'auto:good' }
    ],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit on server
});

const deleteFromCloudinary = async (imageUrl) => {
  try {
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
