const CLOUD_NAME =
  process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || 'dobivtrqy';
const UPLOAD_PRESET =
  process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET ||
  'modern-interior-and-furnitures';
const UPLOAD_FOLDER =
  process.env.REACT_APP_CLOUDINARY_FOLDER || 'modern-interior-and-furnitures';

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
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
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
