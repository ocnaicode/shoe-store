import { NextResponse } from "next/server";
import { getFallbackCoupons, saveFallbackCoupons, connectDB } from "@/lib/db";
import Coupon from "@/models/Coupon";

export async function POST(req: Request) {
  try {
    const { code, orderTotal } = await req.json();
    if (!code) return NextResponse.json({ valid: false, error: "Coupon code required" }, { status: 400 });

    let coupon: any = null;
    const conn = await connectDB();
    if (conn) {
      coupon = await (Coupon as any).findOne({ code: code.toUpperCase(), isActive: true });
    } else {
      const coupons = getFallbackCoupons();
      coupon = coupons.find((c: any) => c.code === code.toUpperCase() && c.isActive);
    }

    if (!coupon) return NextResponse.json({ valid: false, error: "Invalid coupon code" });

    // check expiry
    if (new Date(coupon.expiry) < new Date()) return NextResponse.json({ valid: false, error: "Coupon expired" });
    if (coupon.usedCount >= coupon.usageLimit) return NextResponse.json({ valid: false, error: "Coupon usage limit reached" });
    if (orderTotal && orderTotal < (coupon.minOrder || 0)) return NextResponse.json({ valid: false, error: `Minimum order ৳${coupon.minOrder} required` });

    let discount = 0;
    if (coupon.discountType === "percent") {
      discount = Math.round((orderTotal * coupon.discountValue) / 100);
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }
    discount = Math.min(discount, orderTotal);

    return NextResponse.json({ valid: true, coupon, discount, message: `Coupon applied! You saved ৳${discount}` });
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: e.message }, { status: 500 });
  }
}
