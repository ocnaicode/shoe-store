import { NextResponse } from "next/server";
import { connectDB, getFallbackCoupons, saveFallbackCoupons } from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function GET() {
  try {
    const conn = await connectDB();
    if (conn) {
      const coupons = await (Coupon as any).find().sort({ createdAt: -1 });
      return NextResponse.json({ coupons });
    }
  } catch (e) {
    console.error(e);
  }
  const coupons = getFallbackCoupons();
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { code, discountType, discountValue, minOrder, maxDiscount, expiry, usageLimit, isActive, description } = body;
    if (!code || !discountType || !discountValue || !expiry) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const couponData = {
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      minOrder: Number(minOrder) || 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      expiry: new Date(expiry),
      usageLimit: Number(usageLimit) || 100,
      usedCount: 0,
      isActive: isActive !== false,
      description,
      createdAt: new Date().toISOString(),
      _id: Date.now().toString(),
    };

    const conn = await connectDB();
    if (conn) {
      const coupon = await (Coupon as any).create(couponData);
      return NextResponse.json({ coupon }, { status: 201 });
    }

    const coupons = getFallbackCoupons();
    if (coupons.find((c: any) => c.code === couponData.code)) {
      return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });
    }
    coupons.unshift(couponData);
    saveFallbackCoupons(coupons);
    return NextResponse.json({ coupon: couponData }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      await (Coupon as any).deleteOne({ code: code.toUpperCase() });
      return NextResponse.json({ success: true });
    }
    let coupons = getFallbackCoupons();
    coupons = coupons.filter((c: any) => c.code !== code.toUpperCase());
    saveFallbackCoupons(coupons);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { code, ...updates } = body;
    if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      const coupon = await (Coupon as any).findOneAndUpdate({ code: code.toUpperCase() }, updates, { new: true });
      return NextResponse.json({ coupon });
    }
    const coupons = getFallbackCoupons();
    const idx = coupons.findIndex((c: any) => c.code === code.toUpperCase());
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    coupons[idx] = { ...coupons[idx], ...updates };
    saveFallbackCoupons(coupons);
    return NextResponse.json({ coupon: coupons[idx] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
