const CLOUD_NAME = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_FOLDER = process.env.REACT_APP_CLOUDINARY_FOLDER;
const CLOUDINARY_API_URL =
  process.env.REACT_APP_CLOUDINARY_API_URL || 'https://api.cloudinary.com/v1_1';

const Cloudinary = {
  upload: async (imageFile, folder = 'products', { width, height } = {}) => {
    const formData = new FormData();

    formData.append('file', imageFile);
    formData.append('upload_preset', UPLOAD_PRESET);
    formData.append('folder', `${UPLOAD_FOLDER}/${folder}`);

    // optional transformations (Cloudinary will handle if preset allows)
    if (width) formData.append('width', width);
    if (height) formData.append('height', height);

    const res = await fetch(
      `${CLOUDINARY_API_URL}/${CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || 'Upload failed');
    }

    return data.secure_url;
  },
};

export default Cloudinary;
