import { NextResponse } from "next/server";
import { connectDB, getFallbackHomeSettings, saveFallbackHomeSettings } from "@/lib/db";
import HomeSettings from "@/models/HomeSettings";

export async function GET() {
  try {
    const conn = await connectDB();
    if (conn) {
      let settings = await (HomeSettings as any).findOne();
      if (!settings) {
        const fallback = getFallbackHomeSettings();
        settings = await (HomeSettings as any).create(fallback);
      }
      return NextResponse.json(settings);
    }
  } catch (e) {
    console.error(e);
  }
  return NextResponse.json(getFallbackHomeSettings());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conn = await connectDB();
    if (conn) {
      let settings = await (HomeSettings as any).findOne();
      if (settings) {
        Object.assign(settings, body);
        await settings.save();
        return NextResponse.json(settings);
      } else {
        const created = await (HomeSettings as any).create(body);
        return NextResponse.json(created);
      }
    }
    saveFallbackHomeSettings(body);
    return NextResponse.json(body);
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
