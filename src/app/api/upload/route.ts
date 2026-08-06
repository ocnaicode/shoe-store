import { NextResponse } from "next/server";
import { configureCloudinary, cloudinary } from "@/lib/cloudinary";
import { getSettings } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const customConfig = formData.get("config") ? JSON.parse(formData.get("config") as string) : null;

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Get config from settings or env or custom
    const settings = getSettings();
    const cloudName = customConfig?.cloudName || settings?.cloudinary?.cloudName || process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const apiKey = customConfig?.apiKey || settings?.cloudinary?.apiKey || process.env.CLOUDINARY_API_KEY;
    const apiSecret = customConfig?.apiSecret || settings?.cloudinary?.apiSecret || process.env.CLOUDINARY_API_SECRET;

    const configured = configureCloudinary({ cloudName, apiKey, apiSecret });

    // If cloudinary not configured, return a mock URL (base64 or placeholder)
    if (!configured || !cloudName || !apiKey || !apiSecret) {
      // Return a data URL as fallback so UI still works
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = buffer.toString("base64");
      const mime = file.type || "image/jpeg";
      const dataUrl = `data:${mime};base64,${base64}`;
      // Also return an unsplash placeholder as url for persistence
      return NextResponse.json({
        url: dataUrl,
        secure_url: dataUrl,
        public_id: "fallback_" + Date.now(),
        fallback: true,
        message: "Cloudinary not configured - using local preview. Configure in Admin > Settings for production uploads.",
      });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to cloudinary
    const result: any = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: "hokolifestylebd", resource_type: "image" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    return NextResponse.json({
      url: result.secure_url,
      secure_url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
    });
  } catch (e: any) {
    console.error("Upload error:", e);
    return NextResponse.json({ error: e.message || "Upload failed" }, { status: 500 });
  }
}
