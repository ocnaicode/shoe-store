"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

type Order = any;

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get("orderId") || "");
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const success = searchParams.get("success");

  const handleSearch = () => {
    if (!orderId.trim()) return;
    fetch(`/api/orders?orderId=${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) setOrder(data.order);
        else {
          const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
          const found = local.find((o: any) => o.id === orderId || o.orderId === orderId);
          setOrder(found || null);
        }
        setSearched(true);
      })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
        const found = local.find((o: any) => o.id === orderId || o.orderId === orderId);
        setOrder(found || null);
        setSearched(true);
      });
  };

  useEffect(() => {
    if (searchParams.get("orderId")) handleSearch();
  }, []);

  const steps = [
    { key: "pending", label: "Order Placed", desc: "We have received your order" },
    { key: "processing", label: "Processing", desc: "Seller is preparing your order" },
    { key: "shipped", label: "Shipped", desc: "On the way to you" },
    { key: "delivered", label: "Delivered", desc: "Order completed" },
  ];

  const getStepIndex = (status: string) => steps.findIndex((s) => s.key === status);

  return (
    <div className="max-w-[700px] mx-auto px-4 lg:px-6 py-8">
      {success && orderId && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-6">
          <div className="w-14 h-14 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto text-2xl">✓</div>
          <h2 className="text-2xl font-black mt-3">Order Placed Successfully! 🎉</h2>
          <p className="text-gray-600 text-sm mt-1">
            Your order ID is <span className="font-black text-black">{orderId}</span>. Save it to track your order.
          </p>
          <p className="text-xs text-gray-500 mt-2">We will call you within 2 hours to confirm.</p>
          <div className="flex gap-3 justify-center mt-4">
            <Link href={`/invoice/${orderId}`} className="bg-black text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-zinc-800">📄 View Invoice</Link>
            <Link href={`/invoice/${orderId}`} className="border-2 border-black px-6 py-2.5 rounded-full font-bold text-sm hover:bg-black hover:text-white">Download PDF</Link>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border">
        <h1 className="text-2xl font-black">TRACK YOUR ORDER</h1>
        <p className="text-sm text-gray-500 mt-1">Enter your Order ID to see status</p>
        <div className="flex gap-3 mt-6">
          <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="e.g. HOKO123456" className="flex-1 border rounded-full px-6 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
          <button onClick={handleSearch} className="bg-black text-white font-bold px-8 py-3.5 rounded-full hover:bg-zinc-800 transition">
            TRACK
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Find your Order ID in the confirmation SMS or email. Example: HOKO123456</p>
      </div>

      {searched && !order && (
        <div className="bg-white rounded-2xl p-8 border text-center mt-6">
          <div className="text-5xl">📦</div>
          <h3 className="font-bold mt-3">No order found</h3>
          <p className="text-sm text-gray-500">Please check your Order ID and try again.</p>
        </div>
      )}

      {order && (
        <div className="bg-white rounded-2xl p-6 border mt-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-xs tracking-widest font-bold text-gray-500">ORDER ID</div>
              <div className="font-black text-lg">{order.id || order.orderId}</div>
              <div className="text-xs text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === "delivered" ? "bg-green-100 text-green-700" : order.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>{order.status}</span>
          </div>

          <div className="mt-8 relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200 hidden sm:block"></div>
            <div className="grid grid-cols-4 gap-2 relative">
              {steps.map((step, idx) => {
                const active = idx <= getStepIndex(order.status);
                const isCurrent = idx === getStepIndex(order.status);
                return (
                  <div key={step.key} className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto text-sm font-bold border-2 ${active ? "bg-black text-white border-black" : "bg-white border-gray-200 text-gray-400"}`}>{active ? "✓" : idx + 1}</div>
                    <div className={`text-xs font-bold mt-2 ${isCurrent ? "text-black" : active ? "text-black" : "text-gray-400"}`}>{step.label}</div>
                    <div className="text-[11px] text-gray-500 hidden sm:block">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t mt-8 pt-6">
            <h4 className="font-bold text-sm">ORDER DETAILS</h4>
            <div className="space-y-3 mt-3">
              {(order.items || []).map((it: any, i: number) => (
                <div key={i} className="flex gap-3">
                  <img src={it.image} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-50" />
                  <div className="flex-1">
                    <div className="font-medium text-sm line-clamp-1">{it.name}</div>
                    <div className="text-xs text-gray-500">Size {it.size} • Qty {it.quantity}</div>
                  </div>
                  <div className="font-bold text-sm">{formatPrice(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Payment</span>
                <span className="font-bold uppercase">{order.paymentMethod}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({order.couponCode})</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-base">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mt-6 text-sm">
              <div className="font-bold">Shipping Address</div>
              <div className="text-gray-600 mt-1">
                {order.customer?.name} • {order.customer?.phone}
                <br />
                {order.customer?.email}
                <br />
                {order.customer?.address}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Link href={`/invoice/${order.id || order.orderId}`} className="bg-black text-white rounded-full py-3 text-center font-bold text-sm hover:bg-zinc-800 flex items-center justify-center gap-2">
                📄 Download Invoice
              </Link>
              <a href={`tel:+8801700000000`} className="border-2 border-black rounded-full py-3 text-center font-bold text-sm hover:bg-black hover:text-white">
                Call Support
              </a>
            </div>
            <div className="flex gap-2 mt-3">
              <button
                onClick={async () => {
                  const res = await fetch("/api/invoice", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ orderId: order.id || order.orderId, email: order.customer?.email })});
                  const data = await res.json();
                  alert(data.message);
                }}
                className="w-full border rounded-full py-2.5 text-sm font-bold hover:bg-gray-50"
              >
                📧 Email Invoice to {order.customer?.email || "Customer"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mt-6 text-xs leading-relaxed">
        <strong>Need help?</strong> Call us at <strong>01700-000000</strong> (10AM - 10PM) or email <strong>support@hokolifestylebd.com</strong>. Provide your Order ID for faster support.
      </div>
    </div>
  );
}

export default function TrackClientWrapper() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading...</div>}>
      <TrackContent />
    </Suspense>
  );
}
