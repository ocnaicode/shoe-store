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

  useEffect(() => {
    const savedCoupon = localStorage.getItem("hoko_coupon");
    if (savedCoupon) setCoupon(savedCoupon);
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
    setCoupon(""); setDiscount(0); setCouponApplied(null); setCouponMsg("");
    localStorage.removeItem("hoko_coupon"); localStorage.removeItem("hoko_discount");
  };

  useEffect(() => {
    if (discount > 0) {
      localStorage.setItem("hoko_discount", String(discount));
      localStorage.setItem("hoko_coupon_code", coupon);
    }
  }, [discount, coupon]);

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16 text-center bg-white dark:bg-black">
        <div className="w-24 h-24 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-4xl">🛒</div>
        <h1 className="text-3xl font-semibold tracking-tight mt-6 text-black dark:text-white">Your cart is empty</h1>
        <p className="text-gray-500 dark:text-zinc-400 mt-2">Add some shoes to get started!</p>
        <Link href="/shop" className="inline-flex mt-6 bg-black dark:bg-white text-white dark:text-black font-medium px-8 py-3 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
          START SHOPPING →
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] dark:bg-zinc-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">SHOPPING CART <span className="text-gray-400 font-normal text-lg">({items.length} items)</span></h1>

        <div className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={`${item.id}-${item.size}`} className="bg-white dark:bg-zinc-900 rounded-xl p-4 flex gap-4 border border-gray-100 dark:border-zinc-800">
                <img src={item.image} alt={item.name} className="w-24 h-24 rounded-xl object-cover bg-gray-50 dark:bg-zinc-800" />
                <div className="flex-1 min-w-0">
                  <Link href={`/product/${item.slug}`} className="font-medium hover:underline line-clamp-1 text-black dark:text-white text-sm">{item.name}</Link>
                  <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Size: EU {item.size} {item.color && `• ${item.color}`}</div>
                  <div className="font-semibold mt-1 text-black dark:text-white text-sm">{formatPrice(item.price)}</div>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex items-center border border-gray-200 dark:border-zinc-700 rounded-full">
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-800 rounded-full text-black dark:text-white">−</button>
                      <span className="w-8 text-center text-sm font-medium text-black dark:text-white">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-800 rounded-full text-black dark:text-white">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id, item.size)} className="text-xs font-medium text-red-600 hover:underline ml-2">Remove</button>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-black dark:text-white">{formatPrice(item.price * item.quantity)}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">In Stock</div>
                </div>
              </div>
            ))}

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <Link href="/shop" className="font-medium text-sm hover:underline text-black dark:text-white">← Continue Shopping</Link>
              <span className="text-xs text-gray-500 dark:text-zinc-400">Free shipping over ৳3000</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 sticky top-[80px]">
              <h3 className="font-semibold text-black dark:text-white">Order Summary</h3>
              <div className="space-y-3 mt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-zinc-400">Subtotal ({items.reduce((a, b) => a + b.quantity, 0)} items)</span>
                  <span className="font-medium text-black dark:text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-zinc-400">Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-black dark:text-white"}`}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-zinc-400">Discount {couponApplied ? `(${couponApplied.code})` : ""}</span>
                  <span className={`font-medium ${discount > 0 ? "text-green-600" : "text-black dark:text-white"}`}>{discount > 0 ? `-${formatPrice(discount)}` : "-৳0"}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-zinc-800 pt-3 flex justify-between text-base">
                  <span className="font-semibold text-black dark:text-white">Total</span>
                  <span className="font-semibold text-lg text-black dark:text-white">{formatPrice(grandTotal)}</span>
                </div>
              </div>

              {discount === 0 && (
                <div className="mt-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3 text-xs">
                  <span className="text-amber-900 dark:text-amber-100">🎉 Add <span className="font-semibold">{formatPrice(Math.max(0, 3000 - total))}</span> more for <span className="font-semibold">FREE delivery</span>!</span>
                  <div className="w-full bg-amber-100 dark:bg-amber-900/30 rounded-full h-1.5 mt-2">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(100, (total / 3000) * 100)}%` }}></div>
                  </div>
                </div>
              )}

              <Link href="/checkout" className="mt-6 w-full bg-black dark:bg-white text-white dark:text-black font-medium py-3 rounded-full flex items-center justify-center gap-2 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
                PROCEED TO CHECKOUT →
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <span>🔒</span> Secure Checkout • bKash • Nagad • COD
              </div>

              <div className="mt-6 border-t border-gray-100 dark:border-zinc-800 pt-4">
                <div className="text-xs font-medium mb-2 text-black dark:text-white">Apply Coupon</div>
                <div className="flex gap-2">
                  <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder="WELCOME10" className="flex-1 border border-gray-200 dark:border-zinc-700 rounded-full px-4 py-2.5 text-sm uppercase bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400" />
                  {discount > 0 ? (
                    <button onClick={removeCoupon} className="bg-red-500 text-white px-5 rounded-full text-sm font-medium hover:bg-red-600">Remove</button>
                  ) : (
                    <button onClick={applyCoupon} className="bg-black dark:bg-white text-white dark:text-black px-5 rounded-full text-sm font-medium hover:bg-zinc-800">Apply</button>
                  )}
                </div>
                {couponMsg && <div className={`mt-2 text-xs p-2 rounded-lg ${couponMsg.startsWith("✅") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/30"}`}>{couponMsg}</div>}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Try:</span>
                  {["WELCOME10", "EID2026", "FLAT500"].map((c) => (
                    <button key={c} onClick={() => setCoupon(c)} className="text-xs border border-gray-200 dark:border-zinc-700 rounded-full px-2.5 py-1 hover:bg-black hover:text-white dark:hover:bg-white dark:bg-zinc-900 dark:hover:text-black transition text-gray-600 dark:text-zinc-400">{c}</button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30 rounded-xl p-4 text-sm">
              <div className="font-medium flex items-center gap-2 text-green-900 dark:text-green-100">🛡️ Buyer Protection</div>
              <p className="text-green-700 dark:text-green-300/80 text-xs mt-1">7 days return • 100% original • Cash on delivery available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}