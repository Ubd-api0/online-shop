const cloudinary = require('cloudinary');
const dotenv = require('dotenv');

// config
dotenv.config();

cloudinary.v2.config({
  cloud_name: `${process.env.CLOUDINARY_NAME}`,
  api_key: `${process.env.CLOUDINARY_API_KEY}`,
  api_secret: `${process.env.CLOUDINARY_API_SECRET}`,
});

const Cloudinary = {
  upload: async (image, folder, { width, height }) => {
    const res = await cloudinary.v2.uploader.upload(image, {
      folder: `dress-shop/${folder}`,
      transformation: { width, height, crop: 'fill' },
      overwrite: true,
      invalidate: true,
    });
    return res.secure_url;
  },
};

module.exports = Cloudinary;
