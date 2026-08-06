import { NextResponse } from "next/server";
import { connectDB, getFallbackReviews, saveFallbackReviews } from "@/lib/db";
import Review from "@/models/Review";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  const productSlug = searchParams.get("productSlug");
  const status = searchParams.get("status") || "approved"; // default only approved for public, admin can request all
  const all = searchParams.get("all") === "true";

  try {
    const conn = await connectDB();
    if (conn) {
      const filter: any = {};
      if (productId) filter.productId = productId;
      if (productSlug) filter.productSlug = productSlug;
      if (!all) filter.status = status;
      const reviews = await (Review as any).find(filter).sort({ createdAt: -1 });
      return NextResponse.json({ reviews });
    }
  } catch (e) {
    console.error(e);
  }

  let reviews = getFallbackReviews();
  if (productId) reviews = reviews.filter((r: any) => r.productId === productId);
  if (productSlug) reviews = reviews.filter((r: any) => r.productSlug === productSlug);
  if (!all) reviews = reviews.filter((r: any) => r.status === status);
  // sort newest first
  reviews.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return NextResponse.json({ reviews });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { productId, productSlug, userName, userEmail, rating, comment, images } = body;
    if (!productId || !userName || !userEmail || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const reviewData = {
      productId,
      productSlug: productSlug || productId,
      userName,
      userEmail,
      rating: Number(rating),
      comment,
      images: images || [],
      status: "pending" as const,
      helpful: 0,
      createdAt: new Date().toISOString(),
      _id: Date.now().toString(),
    };

    const conn = await connectDB();
    if (conn) {
      const review = await (Review as any).create({ ...reviewData, _id: undefined });
      return NextResponse.json({ review, message: "Review submitted for approval" }, { status: 201 });
    }

    const reviews = getFallbackReviews();
    reviews.unshift(reviewData);
    saveFallbackReviews(reviews);
    return NextResponse.json({ review: reviewData, message: "Review submitted for approval" }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "id and status required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      const review = await (Review as any).findByIdAndUpdate(id, { status }, { new: true });
      return NextResponse.json({ review });
    }

    const reviews = getFallbackReviews();
    const idx = reviews.findIndex((r: any) => r._id === id || r.id === id);
    if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
    reviews[idx].status = status;
    saveFallbackReviews(reviews);
    return NextResponse.json({ review: reviews[idx] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
