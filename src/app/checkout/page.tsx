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
  const [paymentFields, setPaymentFields] = useState({ senderNumber: "", trxId: "" });
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState("");
  const [delivery, setDelivery] = useState<any>({ insideDhaka: 60, outsideDhaka: 120, freeThreshold: 3000, enabled: true });
  const [paymentConfig, setPaymentConfig] = useState<any>({ bkashNumber: "01700000000", bkashType: "Personal", nagadNumber: "01800000000", nagadType: "Personal", instructions: "Send money to the number above and enter Sender Number & Transaction ID below.", codEnabled: true });

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name, email: user.email, phone: user.phone || f.phone }));
    const savedCoupon = localStorage.getItem("hoko_coupon_code");
    const savedDiscount = localStorage.getItem("hoko_discount");
    if (savedCoupon && savedDiscount) {
      setCouponCode(savedCoupon);
      setDiscount(Number(savedDiscount));
    }
    fetch("/api/settings").then(r=>r.json()).then(d=>{
      if(d.delivery) setDelivery(d.delivery);
      if(d.payment) setPaymentConfig(d.payment);
    }).catch(()=>{});
  }, [user]);

  const shipping = !delivery.enabled ? 0 : total > (delivery.freeThreshold || 3000) ? 0 : form.city === "Dhaka" ? (delivery.insideDhaka || 60) : (delivery.outsideDhaka || 120);
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
    if ((form.payment === "bkash" || form.payment === "nagad") && (!paymentFields.senderNumber || !paymentFields.trxId)) {
      return alert("Please enter Sender Number and Transaction ID for bKash/Nagad payment");
    }
    setPlacing(true);

    let currentUser = user;
    if (form.email && !currentUser) {
      try {
        const autoRes = await fetch("/api/auth/auto-create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone }),
        });
        const autoData = await autoRes.json();
        // A checkout profile is created without signing in an existing user.
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
      paymentStatus: form.payment === "cod" ? "cod" : "pending",
      paymentDetails: (form.payment === "bkash" || form.payment === "nagad") ? {
        senderNumber: paymentFields.senderNumber,
        trxId: paymentFields.trxId,
        bkashNumber: paymentConfig.bkashNumber,
        nagadNumber: paymentConfig.nagadNumber,
      } : undefined,
      userId: currentUser?._id || undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });
      if (couponCode && discount > 0) {
        fetch("/api/coupons", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: couponCode, usedCount: 1 }),
        }).catch(() => {});
      }
    } catch {}

    const existing = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
    existing.unshift(order);
    localStorage.setItem("hoko_orders", JSON.stringify(existing));
    localStorage.setItem("last_order_id", orderId);

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
          note: `HOKO Order ${orderId} - ${items.length} items - ${form.payment}`,
        }),
      });
    } catch {}

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
        <h1 className="text-2xl font-semibold tracking-tight">No items to checkout</h1>
        <Link href="/shop" className="inline-flex mt-4 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-medium">Go to Shop</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] dark:bg-zinc-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-white">CHECKOUT</h1>
        {user && <p className="text-sm text-green-600 mt-1">✅ Logged in as {user.name} ({user.email})</p>}
        {!user && form.email && (
          <p className="text-xs bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg px-3 py-2 mt-2 inline-block text-amber-900 dark:text-amber-100">💡 Account will be auto-created with <strong>{form.email}</strong></p>
        )}
        <div className="flex items-center gap-2 mt-3 text-xs">
          <span className="w-7 h-7 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center font-bold">1</span> <span className="font-bold text-black dark:text-white">Information</span>
          <span className="w-8 h-px bg-gray-200 dark:bg-zinc-700"></span>
          <span className="w-7 h-7 border border-gray-200 dark:border-zinc-700 rounded-full flex items-center justify-center text-black dark:text-white">2</span> <span className="text-gray-500">Payment</span>
          <span className="w-8 h-px bg-gray-200 dark:bg-zinc-700"></span>
          <span className="w-7 h-7 border border-gray-200 dark:border-zinc-700 rounded-full flex items-center justify-center">3</span> <span className="text-gray-500">Review</span>
        </div>

        <form onSubmit={handlePlace} className="grid lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800">
              <h3 className="font-medium text-black dark:text-white mb-4">Contact Information {user && <span className="text-green-600 text-xs">• Auto-filled</span>}</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <label className="sm:col-span-2">
                  <span className="text-xs font-medium">Full Name *</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your full name" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-zinc-900 text-black dark:text-white" />
                </label>
                <label>
                  <span className="text-xs font-medium">Phone Number *</span>
                  <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white" />
                </label>
                <label>
                  <span className="text-xs font-medium">Email * <span className="font-normal text-gray-500">(for auto account)</span></span>
                  <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white" />
                </label>
                <label className="sm:col-span-2">
                  <span className="text-xs font-medium">Full Address *</span>
                  <textarea required value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="House, Road, Area, Thana" rows={3} className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white" />
                </label>
                <label>
                  <span className="text-xs font-medium">City *</span>
                  <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white">
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
                  <span className="text-xs text-gray-500 dark:text-zinc-400">Delivery: {form.city === "Dhaka" ? formatPrice(delivery.insideDhaka) : formatPrice(delivery.outsideDhaka)} {total > delivery.freeThreshold ? "(Free over threshold)" : ""}</span>
                </label>
                <label>
                  <span className="text-xs font-medium">Area</span>
                  <input placeholder="e.g. Gulshan, Dhanmondi" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white" />
                </label>
              </div>
              {!user && (
                <div className="mt-4 bg-gray-50 dark:bg-zinc-800 rounded-lg p-3 text-xs text-gray-600 dark:text-zinc-300">
                  Already have account? <Link href="/auth/login" className="font-bold underline text-black dark:text-white">Login</Link> • New here? No worries, account auto-create hobe!
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800">
              <h3 className="font-medium text-black dark:text-white mb-4">Payment Method</h3>
              <div className="space-y-3">
                {paymentConfig.codEnabled !== false && (
                  <label className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer ${form.payment === "cod" ? "border-black dark:border-white bg-gray-50 dark:bg-zinc-800" : "border-gray-200 dark:border-zinc-700 hover:border-gray-300"}`}>
                    <input type="radio" name="payment" checked={form.payment === "cod"} onChange={() => setForm({ ...form, payment: "cod" })} className="accent-black" />
                    <span className="text-xl">💵</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm flex items-center gap-2 text-black dark:text-white">Cash on Delivery <span className="bg-amber-500 text-black text-[10px] px-2 py-0.5 rounded-full font-bold">Most Popular</span></div>
                      <div className="text-xs text-gray-500">Pay when you receive the product - Steadfast Courier • Delivery {formatPrice(shipping)}</div>
                    </div>
                  </label>
                )}
                {[
                  { id: "bkash", title: "bKash", number: paymentConfig.bkashNumber, type: paymentConfig.bkashType },
                  { id: "nagad", title: "Nagad", number: paymentConfig.nagadNumber, type: paymentConfig.nagadType },
                ].map((m) => (
                  <label key={m.id} className={`flex items-center gap-4 border rounded-xl p-4 cursor-pointer ${form.payment === m.id ? "border-black dark:border-white bg-gray-50 dark:bg-zinc-800" : "border-gray-200 dark:border-zinc-700 hover:border-gray-300"}`}>
                    <input type="radio" name="payment" checked={form.payment === m.id} onChange={() => setForm({ ...form, payment: m.id })} className="accent-black" />
                    <span className="text-xl">📱</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm text-black dark:text-white">{m.title} <span className="text-xs font-normal text-gray-500">({m.type})</span> - {m.number}</div>
                      <div className="text-xs text-gray-500">Send money to {m.number} ({m.type})</div>
                    </div>
                  </label>
                ))}
              </div>

              {(form.payment === "bkash" || form.payment === "nagad") && (
                <div className="mt-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-xl p-4 space-y-3">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100">📋 {paymentConfig.instructions}</div>
                  <div className="bg-white dark:bg-zinc-900 rounded-xl p-3 border border-blue-100 dark:border-blue-900/30">
                    <div className="text-xs font-bold text-black dark:text-white">Send to: {form.payment === "bkash" ? paymentConfig.bkashNumber : paymentConfig.nagadNumber} ({form.payment === "bkash" ? paymentConfig.bkashType : paymentConfig.nagadType})</div>
                    <div className="text-xs text-gray-500 mt-1">Amount: <span className="font-bold text-black dark:text-white">{formatPrice(grandTotal)}</span> • After sending, fill below:</div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <label>
                      <span className="text-xs font-medium">Sender Number * (Jei number theke taka pathiyechen)</span>
                      <input required={form.payment === "bkash" || form.payment === "nagad"} value={paymentFields.senderNumber} onChange={e=> setPaymentFields({...paymentFields, senderNumber: e.target.value})} placeholder="01XXXXXXXXX" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white" />
                    </label>
                    <label>
                      <span className="text-xs font-medium">Transaction ID *</span>
                      <input required={form.payment === "bkash" || form.payment === "nagad"} value={paymentFields.trxId} onChange={e=> setPaymentFields({...paymentFields, trxId: e.target.value})} placeholder="e.g. 9J7K2L8M9N" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-3 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white" />
                    </label>
                  </div>
                  <p className="text-xs text-blue-700 dark:text-blue-300">⚠️ Admin will verify your Transaction ID and mark as Paid. Keep screenshot.</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800 sticky top-[80px]">
              <h3 className="font-medium text-black dark:text-white">Order Summary</h3>
              <div className="space-y-3 mt-4 max-h-[220px] overflow-auto pr-2">
                {items.map((i) => (
                  <div key={`${i.id}-${i.size}`} className="flex gap-3 text-sm">
                    <img src={i.image} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-50 dark:bg-zinc-800" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium line-clamp-1 text-black dark:text-white">{i.name}</div>
                      <div className="text-xs text-gray-500">Size {i.size} • Qty {i.quantity}</div>
                    </div>
                    <div className="font-medium text-black dark:text-white">{formatPrice(i.price * i.quantity)}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code" className="flex-1 border border-gray-200 dark:border-zinc-700 rounded-full px-4 py-2.5 text-sm uppercase bg-white dark:bg-zinc-800 text-black dark:text-white" />
                <button type="button" onClick={applyCoupon} className="bg-black dark:bg-white text-white dark:text-black px-5 rounded-full text-xs font-medium">Apply</button>
              </div>
              {couponMsg && <div className={`mt-2 text-xs p-2 rounded-lg ${couponMsg.startsWith("✅") ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"}`}>{couponMsg}</div>}

              <div className="border-t border-gray-100 dark:border-zinc-800 mt-4 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium text-black dark:text-white">{formatPrice(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping ({form.city})</span>
                  <span className={`font-medium ${shipping === 0 ? "text-green-600" : "text-black dark:text-white"}`}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Coupon ({couponCode})</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-semibold border-t border-gray-100 dark:border-zinc-800 pt-3 text-black dark:text-white">
                  <span>Total</span>
                  <span>{formatPrice(grandTotal)}</span>
                </div>
                {form.payment !== "cod" && <div className="text-xs text-amber-600 dark:text-amber-400 font-medium">Payment: {form.payment.toUpperCase()} - {form.payment === "bkash" ? paymentConfig.bkashNumber : paymentConfig.nagadNumber}</div>}
              </div>

              <button disabled={placing} type="submit" className="w-full mt-6 bg-black dark:bg-white text-white dark:text-black font-medium py-3 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50">
                {placing ? "Placing Order..." : `PLACE ORDER • ${formatPrice(grandTotal)}`}
              </button>

              <p className="text-xs text-center text-gray-400 mt-3">By placing order you agree to Terms & Conditions</p>
              <div className="mt-4 bg-gray-50 dark:bg-zinc-800 rounded-xl p-3 text-xs flex items-start gap-2">
                <span>🔒</span>
                <span className="text-gray-600 dark:text-zinc-300">Steadfast Courier • Need help? Call <strong className="text-black dark:text-white">{paymentConfig.bkashNumber || "01700-000000"}</strong></span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
