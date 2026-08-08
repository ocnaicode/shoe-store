import { NextResponse } from "next/server";
import { connectDB, getFallbackProducts, saveFallbackProducts, ensureDataDir } from "@/lib/db";
import Product from "@/models/Product";
import { products as mockProducts } from "@/lib/data";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const conn = await connectDB();
    if (conn) {
      let products = await (Product as any).find().sort({ createdAt: -1 });
      if (products.length === 0) {
        // Auto-seed dummy data properly into Atlas if empty
        const toInsert = mockProducts.map(p => ({
          name: p.name,
          slug: p.slug,
          description: p.description,
          price: p.price,
          comparePrice: p.comparePrice,
          images: p.images,
          category: p.category,
          brand: p.brand,
          sizes: p.sizes,
          colors: p.colors,
          stock: p.stock,
          rating: p.rating,
          reviews: p.reviews,
          isFeatured: p.isFeatured,
          isNew: p.isNew,
          isBestSeller: p.isBestSeller,
          variants: p.sizes.map(s=> ({ size: s, stock: Math.floor(Math.random()*25)+8, price: p.price })),
          descriptionImages: [],
        }));
        await (Product as any).insertMany(toInsert);
        products = await (Product as any).find().sort({ createdAt: -1 });
      }
      return NextResponse.json({ products });
    }
  } catch (e) {
    console.error(e);
  }

  // fallback file
  const fallback = getFallbackProducts();
  if (fallback && fallback.length > 0) return NextResponse.json({ products: fallback });

  // ensure file exists with dummy data
  saveFallbackProducts(mockProducts);
  return NextResponse.json({ products: mockProducts });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const conn = await connectDB();
    if (conn) {
      const product = await (Product as any).create(body);
      return NextResponse.json({ product }, { status: 201 });
    }
    const existing = getFallbackProducts() || mockProducts;
    const newProduct = { ...body, _id: Date.now().toString(), createdAt: new Date().toISOString() };
    existing.unshift(newProduct);
    saveFallbackProducts(existing);
    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const conn = await connectDB();
    if (conn) {
      await (Product as any).findByIdAndDelete(id);
      return NextResponse.json({ success: true });
    }
    let products = getFallbackProducts() || [];
    products = products.filter((p:any)=> p._id !== id && p.id !== id);
    saveFallbackProducts(products);
    return NextResponse.json({ success: true });
  } catch(e:any){ return NextResponse.json({ error: e.message }, { status: 500 }); }
}
