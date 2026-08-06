import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";

export async function GET() {
  const settings = getSettings();
  // Don't expose secret fully
  const safe = {
    ...settings,
    cloudinary: {
      ...settings.cloudinary,
      apiSecret: settings.cloudinary.apiSecret ? "••••••••" + settings.cloudinary.apiSecret.slice(-4) : "",
    },
  };
  return NextResponse.json(safe);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const current = getSettings();
    const updated = {
      ...current,
      cloudinary: {
        cloudName: body.cloudName || current.cloudinary.cloudName,
        apiKey: body.apiKey || current.cloudinary.apiKey,
        // Only update secret if not masked
        apiSecret: body.apiSecret && !body.apiSecret.includes("•") ? body.apiSecret : current.cloudinary.apiSecret,
        uploadPreset: body.uploadPreset || current.cloudinary.uploadPreset,
      },
      updatedAt: new Date().toISOString(),
    };
    saveSettings(updated);
    return NextResponse.json({ success: true, settings: updated });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
