import { NextResponse } from "next/server";
import { connectDB, getFallbackCategories, saveFallbackCategories } from "@/lib/db";
import Category from "@/models/Category";

export async function GET() {
  try {
    const conn = await connectDB();
    if (conn) {
      let categories = await (Category as any).find().sort({ createdAt: -1 });
      if (categories.length === 0) {
        // Seed defaults if empty
        const defaults = getFallbackCategories();
        // Insert into DB
        for (const cat of defaults) {
          await (Category as any).create({ name: cat.name, slug: cat.slug, image: cat.image, description: cat.description, count: cat.count, isActive: cat.isActive });
        }
        categories = await (Category as any).find().sort({ createdAt: -1 });
      }
      return NextResponse.json({ categories });
    }
  } catch (e) {
    console.error(e);
  }
  return NextResponse.json({ categories: getFallbackCategories() });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, image, description } = body;
    if (!name || !image) return NextResponse.json({ error: "Name and image required" }, { status: 400 });
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    
    const conn = await connectDB();
    if (conn) {
      const existing = await (Category as any).findOne({ slug });
      if (existing) return NextResponse.json({ error: "Category already exists" }, { status: 400 });
      const category = await (Category as any).create({ name, slug, image, description, count: 0, isActive: true });
      return NextResponse.json({ category }, { status: 201 });
    }

    const categories = getFallbackCategories();
    if (categories.find((c: any) => c.slug === slug)) return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    const newCat = { _id: Date.now().toString(), name, slug, image, description: description || "", count: 0, isActive: true, createdAt: new Date().toISOString() };
    categories.push(newCat);
    saveFallbackCategories(categories);
    return NextResponse.json({ category: newCat }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { _id, id, name, image, description, isActive } = body;
    const targetId = _id || id;
    if (!targetId) return NextResponse.json({ error: "ID required" }, { status: 400 });
    
    const conn = await connectDB();
    if (conn) {
      const updates: any = {};
      if (name) { updates.name = name; updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
      if (image) updates.image = image;
      if (description !== undefined) updates.description = description;
      if (isActive !== undefined) updates.isActive = isActive;
      const category = await (Category as any).findByIdAndUpdate(targetId, updates, { new: true });
      return NextResponse.json({ category });
    }

    const categories = getFallbackCategories();
    const idx = categories.findIndex((c: any) => c._id === targetId || c.id === targetId);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    if (name) { categories[idx].name = name; categories[idx].slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
    if (image) categories[idx].image = image;
    if (description !== undefined) categories[idx].description = description;
    if (isActive !== undefined) categories[idx].isActive = isActive;
    saveFallbackCategories(categories);
    return NextResponse.json({ category: categories[idx] });
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
      await (Category as any).findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    }

    let categories = getFallbackCategories();
    categories = categories.filter((c: any) => c._id !== id && c.id !== id);
    saveFallbackCategories(categories);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
