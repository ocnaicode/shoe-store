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
      const products = await (Product as any).find().sort({ createdAt: -1 });
      return NextResponse.json({ products });
    }
  } catch (e) {
    console.error(e);
  }

  // fallback
  const fallback = getFallbackProducts();
  if (fallback) return NextResponse.json({ products: fallback });

  // ensure file exists
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
    // fallback file
    const existing = getFallbackProducts() || mockProducts;
    const newProduct = { ...body, _id: Date.now().toString(), createdAt: new Date().toISOString() };
    existing.unshift(newProduct);
    saveFallbackProducts(existing);
    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
