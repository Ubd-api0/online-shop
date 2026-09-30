/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Product/shop/avatar images are hosted wherever the owner's Cloudinary
    // account (or any other absolute URL) points — same as the old CRA app,
    // which rendered raw <img src> with no host restriction.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
