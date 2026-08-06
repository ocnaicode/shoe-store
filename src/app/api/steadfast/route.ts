import { NextResponse } from "next/server";
import { getSettings, saveSettings } from "@/lib/db";

export async function GET() {
  const settings = getSettings();
  const safe = {
    enabled: settings.steadfast.enabled,
    apiKey: settings.steadfast.apiKey ? "••••" + settings.steadfast.apiKey.slice(-4) : "",
    secretKey: settings.steadfast.secretKey ? "••••" + settings.steadfast.secretKey.slice(-4) : "",
    baseUrl: settings.steadfast.baseUrl,
  };
  return NextResponse.json(safe);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = getSettings();
    const updated = {
      ...settings,
      steadfast: {
        enabled: body.enabled ?? settings.steadfast.enabled,
        apiKey: body.apiKey?.includes("•") ? settings.steadfast.apiKey : body.apiKey ?? settings.steadfast.apiKey,
        secretKey: body.secretKey?.includes("•") ? settings.steadfast.secretKey : body.secretKey ?? settings.steadfast.secretKey,
        baseUrl: body.baseUrl || settings.steadfast.baseUrl,
      },
    };
    saveSettings(updated);
    return NextResponse.json({ success: true, steadfast: updated.steadfast });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
