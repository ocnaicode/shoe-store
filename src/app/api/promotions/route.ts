import { NextResponse } from "next/server";
import { connectDB, getFallbackPromotions, saveFallbackPromotions } from "@/lib/db";
import Promotion from "@/models/Promotion";

export async function GET() {
  try {
    const conn = await connectDB();
    if (conn) {
      const promotions = await (Promotion as any).find().sort({ createdAt: -1 });
      return NextResponse.json({ promotions });
    }
  } catch (e) {
    console.error(e);
  }
  const promotions = getFallbackPromotions();
  // filter active only for public, but return all for admin (client will filter)
  return NextResponse.json({ promotions });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, image, link, buttonText, isActive, startDate, endDate, displayDelay } = body;
    if (!title || !image) return NextResponse.json({ error: "Title and image required" }, { status: 400 });

    const promotionData = {
      title,
      subtitle: subtitle || "",
      image,
      link: link || "/shop",
      buttonText: buttonText || "Shop Now",
      isActive: isActive !== false,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      displayDelay: Number(displayDelay) || 3,
      createdAt: new Date().toISOString(),
      _id: Date.now().toString(),
    };

    const conn = await connectDB();
    if (conn) {
      const promotion = await (Promotion as any).create(promotionData);
      return NextResponse.json({ promotion }, { status: 201 });
    }

    const promotions = getFallbackPromotions();
    promotions.unshift(promotionData);
    saveFallbackPromotions(promotions);
    return NextResponse.json({ promotion: promotionData }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { _id, id, ...updates } = body;
    const targetId = _id || id;
    if (!targetId) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      const promotion = await (Promotion as any).findByIdAndUpdate(targetId, updates, { new: true });
      return NextResponse.json({ promotion });
    }

    const promotions = getFallbackPromotions();
    const idx = promotions.findIndex((p: any) => p._id === targetId || p.id === targetId);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    promotions[idx] = { ...promotions[idx], ...updates };
    saveFallbackPromotions(promotions);
    return NextResponse.json({ promotion: promotions[idx] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      await (Promotion as any).findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    }

    let promotions = getFallbackPromotions();
    promotions = promotions.filter((p: any) => p._id !== id && p.id !== id);
    saveFallbackPromotions(promotions);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
