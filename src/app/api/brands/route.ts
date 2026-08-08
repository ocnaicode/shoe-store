import { NextResponse } from "next/server";
import { connectDB, getFallbackBrands, saveFallbackBrands } from "@/lib/db";
import Brand from "@/models/Brand";

export async function GET() {
  try {
    const conn = await connectDB();
    if (conn) {
      let brands = await (Brand as any).find().sort({ createdAt: -1 });
      if (brands.length === 0) {
        const defaults = getFallbackBrands();
        for (const b of defaults) {
          await (Brand as any).create({ name: b.name, slug: b.slug, logo: b.logo, description: b.description, isActive: b.isActive });
        }
        brands = await (Brand as any).find().sort({ createdAt: -1 });
      }
      return NextResponse.json({ brands });
    }
  } catch (e) {
    console.error(e);
  }
  return NextResponse.json({ brands: getFallbackBrands() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, logo, description } = body;
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const conn = await connectDB();
    if (conn) {
      const existing = await (Brand as any).findOne({ slug });
      if (existing) return NextResponse.json({ error: "Brand already exists" }, { status: 400 });
      const brand = await (Brand as any).create({ name, slug, logo: logo || "", description: description || "", isActive: true });
      return NextResponse.json({ brand }, { status: 201 });
    }
    const brands = getFallbackBrands();
    if (brands.find((b: any) => b.slug === slug)) return NextResponse.json({ error: "Brand already exists" }, { status: 400 });
    const newBrand = { _id: Date.now().toString(), name, slug, logo: logo || "", description: description || "", isActive: true, createdAt: new Date().toISOString() };
    brands.push(newBrand);
    saveFallbackBrands(brands);
    return NextResponse.json({ brand: newBrand }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { _id, id, name, logo, description, isActive } = body;
    const targetId = _id || id;
    if (!targetId) return NextResponse.json({ error: "ID required" }, { status: 400 });
    const conn = await connectDB();
    if (conn) {
      const updates: any = {};
      if (name) { updates.name = name; updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
      if (logo !== undefined) updates.logo = logo;
      if (description !== undefined) updates.description = description;
      if (isActive !== undefined) updates.isActive = isActive;
      const brand = await (Brand as any).findByIdAndUpdate(targetId, updates, { new: true });
      return NextResponse.json({ brand });
    }
    const brands = getFallbackBrands();
    const idx = brands.findIndex((b: any) => b._id === targetId || b.id === targetId);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (name) { brands[idx].name = name; brands[idx].slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
    if (logo !== undefined) brands[idx].logo = logo;
    if (description !== undefined) brands[idx].description = description;
    if (isActive !== undefined) brands[idx].isActive = isActive;
    saveFallbackBrands(brands);
    return NextResponse.json({ brand: brands[idx] });
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
      await (Brand as any).findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    }
    let brands = getFallbackBrands();
    brands = brands.filter((b: any) => b._id !== id && b.id !== id);
    saveFallbackBrands(brands);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
