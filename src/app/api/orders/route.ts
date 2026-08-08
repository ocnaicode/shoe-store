import { NextResponse } from "next/server";
import { connectDB, getFallbackOrders, saveFallbackOrders } from "@/lib/db";
import Order from "@/models/Order";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");

  try {
    const conn = await connectDB();
    if (conn) {
      if (orderId) {
        const order = await (Order as any).findOne({ orderId });
        if (order) return NextResponse.json({ order });
      } else {
        const orders = await (Order as any).find().sort({ createdAt: -1 }).limit(100);
        return NextResponse.json({ orders });
      }
    }
  } catch (e) {
    console.error(e);
  }

  const orders = getFallbackOrders();
  if (orderId) {
    const found = orders.find((o: any) => o.id === orderId || o.orderId === orderId);
    if (found) return NextResponse.json({ order: found });
    return NextResponse.json({ order: null }, { status: 404 });
  }
  return NextResponse.json({ orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderData = {
      orderId: body.id || body.orderId || "HOKO" + Date.now().toString().slice(-6),
      items: body.items,
      total: body.total,
      subtotal: body.subtotal,
      shipping: body.shipping,
      discount: body.discount,
      couponCode: body.couponCode,
      status: body.status || "pending",
      customer: body.customer,
      paymentMethod: body.paymentMethod,
      paymentStatus: body.paymentStatus || (body.paymentMethod === "cod" ? "cod" : "pending"),
      paymentDetails: body.paymentDetails,
    };

    const conn = await connectDB();
    if (conn) {
      const order = await (Order as any).create(orderData);
      return NextResponse.json({ order }, { status: 201 });
    }

    const orders = getFallbackOrders();
    const newOrder = { ...body, id: orderData.orderId, orderId: orderData.orderId, createdAt: new Date().toISOString() };
    orders.unshift(newOrder);
    saveFallbackOrders(orders);
    return NextResponse.json({ order: newOrder }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { orderId, status, paymentStatus } = await req.json();
    const updates: any = {};
    if (status) updates.status = status;
    if (paymentStatus) updates.paymentStatus = paymentStatus;

    const conn = await connectDB();
    if (conn) {
      const order = await (Order as any).findOneAndUpdate({ orderId }, updates, { new: true });
      return NextResponse.json({ order });
    }
    const orders = getFallbackOrders();
    const idx = orders.findIndex((o: any) => o.id === orderId || o.orderId === orderId);
    if (idx !== -1) {
      if (status) orders[idx].status = status;
      if (paymentStatus) orders[idx].paymentStatus = paymentStatus;
      saveFallbackOrders(orders);
      return NextResponse.json({ order: orders[idx] });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
