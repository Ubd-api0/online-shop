import { publicEnv } from "@/lib/env";

const Cloudinary = {
  upload: async (imageFile, folder = "products", { width, height } = {}) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", publicEnv.cloudinaryUploadPreset);
    formData.append("folder", `${publicEnv.cloudinaryFolder}/${folder}`);
    if (width) formData.append("width", width);
    if (height) formData.append("height", height);

    const res = await fetch(`${publicEnv.cloudinaryApiUrl}/${publicEnv.cloudinaryCloudName}/image/upload`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || "Upload failed");
    }
    return data.secure_url;
  },
};

export default Cloudinary;
