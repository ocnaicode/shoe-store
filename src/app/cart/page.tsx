"use client";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function CartPage() {
  const items = useStore((s) => s.items);
  const updateQuantity = useStore((s) => s.updateQuantity);
  const removeFromCart = useStore((s) => s.removeFromCart);
  const total = useStore((s) => s.total());
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [couponApplied, setCouponApplied] = useState<any>(null);

  const shipping = total > 3000 ? 0 : 120;
  const grandTotal = total + shipping - discount;

  // Check for abandoned cart coupon auto-fill
  useEffect(() => {
    const savedCoupon = localStorage.getItem("hoko_coupon");
    if (savedCoupon) setCoupon(savedCoupon);
    // Check URL coupon
    const params = new URLSearchParams(window.location.search);
    if (params.get("coupon")) setCoupon(params.get("coupon") || "");
  }, []);

  const applyCoupon = async () => {
    if (!coupon.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: coupon, orderTotal: total }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setCouponApplied(data.coupon);
        setCouponMsg(`✅ ${data.message}`);
        localStorage.setItem("hoko_coupon", coupon);
        localStorage.setItem("hoko_discount", String(data.discount));
      } else {
        setDiscount(0);
        setCouponMsg(`❌ ${data.error}`);
      }
    } catch (e: any) {
      setCouponMsg("❌ Error validating coupon");
    }
  };

  const removeCoupon = () => {
    setCoupon("");
    setDiscount(0);
    setCouponApplied(null);
    setCouponMsg("");
    localStorage.removeItem("hoko_coupon");
    localStorage.removeItem("hoko_discount");
  };

  // Persist discount for checkout
  useEffect(() => {
    if (discount > 0) {
      localStorage.setItem("hoko_discount", String(discount));
      localStorage.setItem("hoko_coupon_code", coupon);
    }
  }, [discount, coupon]);

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16 text-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-4xl">🛒</div>
        <h1 className="text-3xl font-black mt-6">Your cart is empty</h1>
        <p className="text-gray-500 mt-2">Add some shoes to get started!</p>
        <Link href="/shop" className="inline-flex mt-6 bg-black text-white font-bold px-8 py-3 rounded-full hover:bg-zinc-800 transition">
          START SHOPPING →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        <h1 className="text-3xl font-black">SHOPPING CART <span className="text-gray-400 font-normal text-xl">({items.length} items)</span></h1>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="bg-white rounded-2xl p-4 flex gap-4 border border-gray-100">
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover bg-gray-50" />
                <div className="flex-1">
                  <Link href={`/product/${item.slug}`} className="font-bold hover:underline line-clamp-1">{item.name}</Link>
                  <div className="text-xs text-gray-500 mt-1">Size: EU {item.size} {item.color && `• ${item.color}`}</div>
                  <div className="font-black mt-1">{formatPrice(item.price)}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center border rounded-full">
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">−</button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-xs font-bold text-red-600 hover:underline ml-2">Remove</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black">{formatPrice(item.price * item.quantity)}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">In Stock</div>
                </div>
              </div>
            ))}

            <div className="bg-white rounded-2xl p-4 border flex items-center justify-between">
              <Link href="/shop" className="font-bold text-sm hover:underline">← Continue Shopping</Link>
              <span className="text-xs text-gray-500">Free shipping over ৳3000</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-6 border sticky top-[90px]">
              <h3 className="font-black">ORDER SUMMARY</h3>
              <div className="space-y-3 mt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className={`font-bold ${shipping === 0 ? "text-green-600" : ""}`}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Discount {couponApplied ? `(${couponApplied.code})` : ""}</span>
                  <span className={`font-bold ${discount > 0 ? "text-green-600" : ""}`}>{discount > 0 ? `-${formatPrice(discount)}` : "-৳0"}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-base">
                  <span className="font-black">Total</span>
                  <span className="font-black text-xl">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {discount === 0 && (
                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
                  🎉 Add <span className="font-bold">{formatPrice(Math.max(0, 3000 - total))}</span> more for <span className="font-bold">FREE delivery</span>!
                  <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (total / 3000) * 100)}%` }}></div>
                  </div>
                </div>
              )}

              <Link href="/checkout" className="mt-6 w-full bg-black text-white font-black py-4 rounded-full flex items-center justify-center gap-2 hover:bg-zinc-800 transition">
                PROCEED TO CHECKOUT →
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                <span>🔒</span> Secure Checkout • bKash • Nagad • COD
              </div>

              <div className="mt-6 border-t pt-4">
                <div className="text-xs font-bold mb-2">🎟️ Apply Coupon</div>
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="e.g. WELCOME10" className="flex-1 border rounded-full px-4 py-2.5 text-sm uppercase" />
                  {discount > 0 ? (
                    <button onClick={removeCoupon} className="bg-red-500 text-white px-6 rounded-full text-sm font-bold hover:bg-red-600">Remove</button>
                  ) : (
                    <button onClick={applyCoupon} className="bg-black text-white px-6 rounded-full text-sm font-bold hover:bg-zinc-800">Apply</button>
                  )}
                </div>
                {couponMsg && <div className={`mt-2 text-xs p-2 rounded-lg ${couponMsg.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{couponMsg}</div>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs text-gray-500">Try:</span>
                  {["WELCOME10", "EID2026", "FLAT500"].map((c) => (
                    <button key={c} onClick={() => setCoupon(c)} className="text-xs border rounded-full px-2.5 py-1 hover:bg-black hover:text-white transition">{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-sm">
              <div className="font-bold flex items-center gap-2">🛡️ Buyer Protection</div>
              <p className="text-gray-600 text-xs mt-1">7 days return • 100% original • Cash on delivery available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
