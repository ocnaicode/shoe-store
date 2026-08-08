"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const items = useStore((s) => s.items);
  const total = useStore((s) => s.total());
  const clearCart = useStore((s) => s.clearCart);
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);

  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "", email: user?.email || "", address: "", city: "Dhaka", payment: "cod" });
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name, email: user.email, phone: user.phone || f.phone }));
    const savedCoupon = localStorage.getItem("hoko_coupon_code");
    const savedDiscount = localStorage.getItem("hoko_discount");
    if (savedCoupon && savedDiscount) {
      setCouponCode(savedCoupon);
      setDiscount(Number(savedDiscount));
    }
  }, [user]);

  const shipping = total > 3000 ? 0 : form.city === "Dhaka" ? 60 : 120;
  const grandTotal = total + shipping - discount;

  const applyCoupon = async () => {
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, orderTotal: total }),
      });
      const data = await res.json();
      if (data.valid) {
        setDiscount(data.discount);
        setCouponMsg(`✅ ${data.message}`);
        localStorage.setItem("hoko_discount", String(data.discount));
        localStorage.setItem("hoko_coupon_code", couponCode);
      } else {
        setDiscount(0);
        setCouponMsg(`❌ ${data.error}`);
      }
    } catch {
      setCouponMsg("❌ Error");
    }
  };

  const handlePlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert("Cart is empty");
    if (!form.name || !form.phone || !form.address) return alert("Please fill required fields");
    setPlacing(true);

    // Auto-create account if email provided and not logged in
    let authToken = localStorage.getItem("hoko_token");
    let currentUser = user;
    if (form.email && !currentUser) {
      try {
        const autoRes = await fetch("/api/auth/auto-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone }),
        });
        const autoData = await autoRes.json();
        if (autoData.token) {
          authToken = autoData.token;
          localStorage.setItem("hoko_token", autoData.token);
          setAuth(autoData.user, autoData.token);
          currentUser = autoData.user;
          if (autoData.created) {
            console.log("Auto-created account for", form.email);
          }
        }
      } catch (err) {
        console.error("Auto-create failed", err);
      }
    }

    const orderId = "HOKO" + Date.now().toString().slice(-6);
    const order = {
      id: orderId,
      items: items.map((i) => ({ productId: i.id, name: i.name, price: i.price, quantity: i.quantity, size: i.size, image: i.image })),
      total: grandTotal,
      subtotal: total,
      shipping,
      discount,
      couponCode: couponCode || undefined,
      status: "pending" as const,
      customer: { name: form.name, phone: form.phone, email: form.email, address: `${form.address}, ${form.city}` },
      paymentMethod: form.payment,
      userId: currentUser?._id || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      // If coupon used, increment usage
      if (couponCode && discount > 0) {
        fetch("/api/coupons", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCode, usedCount: 1 }),
        }).catch(() => {});
        // Also manually increment fallback
      }
    } catch {}

    const existing = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
    existing.unshift(order);
    localStorage.setItem("hoko_orders", JSON.stringify(existing));
    localStorage.setItem("last_order_id", orderId);

    // Create Steadfast consignment if enabled (fire and forget)
    try {
      await fetch("/api/steadfast/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: orderId,
          recipient_name: form.name,
          recipient_phone: form.phone,
          recipient_address: `${form.address}, ${form.city}`,
          cod_amount: form.payment === "cod" ? grandTotal : 0,
          note: `HOKO Order ${orderId} - ${items.length} items`,
        }),
      });
    } catch {}

    // Clear coupon and cart
    localStorage.removeItem("hoko_coupon");
    localStorage.removeItem("hoko_coupon_code");
    localStorage.removeItem("hoko_discount");
    clearCart();
    setPlacing(false);
    router.push(`/track-order?orderId=${orderId}&success=1`);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16 text-center">
        <h1 className="text-2xl font-black">No items to checkout</h1>
        <Link href="/shop" className="inline-flex mt-4 bg-black text-white px-6 py-3 rounded-full font-bold">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] dark:bg-zinc-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        <h1 className="text-3xl font-black">CHECKOUT</h1>
        {user && <p className="text-sm text-green-600 mt-1">✅ Logged in as {user.name} ({user.email})</p>}
        {!user && form.email && (
          <p className="text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2 inline-block">💡 Account will be auto-created with <strong>{form.email}</strong> - you can set password later from "Change Password" page</p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs">
          <span className="w-7 h-7 bg-black text-white rounded-full flex items-center justify-center font-bold">1</span> <span className="font-bold">Information</span>
          <span className="w-8 h-px bg-gray-300"></span>
          <span className="w-7 h-7 border rounded-full flex items-center justify-center">2</span> <span className="text-gray-500 dark:text-zinc-400">Payment</span>
          <span className="w-8 h-px bg-gray-300"></span>
          <span className="w-7 h-7 border rounded-full flex items-center justify-center">3</span> <span className="text-gray-500 dark:text-zinc-400">Review</span>
        </div>

        <form onSubmit={handlePlace} className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
              <h3 className="font-black mb-4">CONTACT INFORMATION {user && <span className="text-green-600 text-xs">• Auto-filled</span>}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2">
                  <span className="text-xs font-bold">Full Name *</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                </label>
                <label>
                  <span className="text-xs font-bold">Phone Number *</span>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
                </label>
                <label>
                  <span className="text-xs font-bold">Email * <span className="font-normal text-gray-500 dark:text-zinc-400">(for auto account)</span></span>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-bold">Full Address *</span>
                  <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, Road, Area, Thana" rows={3} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
                </label>
                <label>
                  <span className="text-xs font-bold">City</span>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm bg-white dark:bg-zinc-900">
                    <option>Dhaka</option>
                    <option>Chittagong</option>
                    <option>Sylhet</option>
                    <option>Rajshahi</option>
                    <option>Khulna</option>
                    <option>Barishal</option>
                    <option>Rangpur</option>
                    <option>Mymensingh</option>
                    <option>Other</option>
                  </select>
                </label>
                <label>
                  <span className="text-xs font-bold">Area</span>
                  <input placeholder="e.g. Gulshan, Dhanmondi" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
                </label>
              </div>
              {!user && (
                <div className="mt-4 bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 text-xs">
                  Already have account? <Link href="/auth/login" className="font-bold underline">Login</Link> • New here? No worries, account auto-create hobe!
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
              <h3 className="font-black mb-4">PAYMENT METHOD</h3>
              <div className="space-y-3">
                {[
                  { id: "cod", title: "Cash on Delivery", desc: "Pay when you receive the product - Steadfast Courier", icon: "💵", badge: "Most Popular" },
                  { id: "bkash", title: "bKash", desc: "Pay via bKash - 01700000000", icon: "📱" },
                  { id: "nagad", title: "Nagad", desc: "Pay via Nagad", icon: "💳" },
                  { id: "card", title: "Credit / Debit Card", desc: "Visa, Mastercard, Amex via SSLCommerz", icon: "💳" },
                ].map((m) => (
                  <label key={m.id} className={`flex items-center gap-4 border rounded-2xl p-4 cursor-pointer ${form.payment === m.id ? "border-black bg-gray-50 dark:bg-zinc-800 ring-1 ring-black" : "hover:border-gray-300"}`}>
                    <input type="radio" name="payment" checked={form.payment === m.id} onChange={() => setForm({ ...form, payment: m.id })} className="accent-black" />
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm flex items-center gap-2">
                        {m.title} {m.badge && <span className="bg-amber-500 text-black dark:text-white text-[10px] px-2 py-0.5 rounded-full">{m.badge}</span>}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400">{m.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border sticky top-[90px]">
              <h3 className="font-black">ORDER SUMMARY</h3>
              <div className="space-y-3 mt-4 max-h-[220px] overflow-auto pr-2">
                {items.map((i) => (
                  <div key={`${i.id}-${i.size}`} className="flex gap-3 text-sm">
                    <img src={i.image} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-50 dark:bg-zinc-800" />
                    <div className="flex-1">
                      <div className="font-medium line-clamp-1">{i.name}</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400">Size {i.size} • Qty {i.quantity}</div>
                    </div>
                    <div className="font-bold">{formatPrice(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="flex-1 border rounded-full px-4 py-2.5 text-sm uppercase" />
                <button type="button" onClick={applyCoupon} className="bg-black text-white px-5 rounded-full text-xs font-bold">Apply</button>
              </div>
              {couponMsg && <div className={`mt-2 text-xs p-2 rounded-lg ${couponMsg.startsWith("✅") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{couponMsg}</div>}

              <div className="border-t mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-zinc-300">Subtotal</span>
                  <span className="font-bold">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-zinc-300">Shipping ({form.city})</span>
                  <span className={`font-bold ${shipping === 0 ? "text-green-600" : ""}`}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Coupon ({couponCode})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black border-t pt-3">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
              </div>

              <button disabled={placing} type="submit" className="w-full mt-6 bg-black text-white font-black py-4 rounded-full hover:bg-zinc-800 transition disabled:opacity-50">
                {placing ? "Placing Order..." : `PLACE ORDER • ${formatPrice(grandTotal)}`}
              </button>

              <p className="text-xs text-center text-gray-500 dark:text-zinc-400 mt-3">By placing order you agree to Terms & Conditions</p>
              <div className="mt-4 bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 text-xs flex items-start gap-2">
                <span>🔒</span>
                <span>Steadfast Courier e pathano hobe • Need help? Call <strong>01700-000000</strong></span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}