import { v2 as cloudinary } from "cloudinary";

export function configureCloudinary(config?: { cloudName?: string; apiKey?: string; apiSecret?: string }) {
  const cloudName = config?.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = config?.apiKey || process.env.CLOUDINARY_API_KEY;
  const apiSecret = config?.apiSecret || process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
    return true;
  }
  return false;
}

export { cloudinary };
