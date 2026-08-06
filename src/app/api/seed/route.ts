import { NextResponse } from "next/server";
import { products as demoProducts } from "@/lib/data";
import { connectDB, getFallbackProducts, saveFallbackProducts } from "@/lib/db";
import Product from "@/models/Product";

export async function POST() {
  try {
    const conn = await connectDB();
    let inserted: any[] = [];
    let skipped = 0;

    if (conn) {
      for (const p of demoProducts) {
        const existing = await (Product as any).findOne({ slug: p.slug });
        if (existing) { skipped++; continue; }
        const created = await (Product as any).create({ ...p, variants: p.sizes.map(s=> ({ size: s, stock: Math.floor(Math.random()*30)+10, price: p.price }))});
        inserted.push(created);
      }
      return NextResponse.json({ success: true, inserted: inserted.length, skipped, total: demoProducts.length, source: "MongoDB Atlas" });
    } else {
      const existing = getFallbackProducts() || [];
      for (const p of demoProducts) {
        if (existing.find((e:any)=> e.slug === p.slug)) { skipped++; continue; }
        existing.push({ ...p, _id: Date.now().toString()+Math.random().toString(36).slice(2,5), variants: p.sizes.map(s=> ({ size: s, stock: Math.floor(Math.random()*30)+10, price: p.price })), createdAt: new Date().toISOString() });
      }
      saveFallbackProducts(existing);
      inserted = demoProducts;
      return NextResponse.json({ success: true, inserted: inserted.length - skipped, skipped, total: demoProducts.length, source: "Fallback JSON" });
    }
  } catch (e:any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const conn = await connectDB();
    if (conn) {
      const result = await (Product as any).deleteMany({ slug: { $in: (await import("@/lib/data")).products.map(p=>p.slug)}});
      return NextResponse.json({ success: true, deleted: result.deletedCount });
    } else {
      let existing = getFallbackProducts() || [];
      const demoSlugs = (await import("@/lib/data")).products.map(p=>p.slug);
      const before = existing.length;
      existing = existing.filter((p:any)=> !demoSlugs.includes(p.slug));
      saveFallbackProducts(existing);
      return NextResponse.json({ success: true, deleted: before - existing.length });
    }
  } catch(e:any){ return NextResponse.json({ error: e.message }, { status: 500 }); }
}
