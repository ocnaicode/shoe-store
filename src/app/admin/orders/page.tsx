"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [steadfastMsg, setSteadfastMsg] = useState("");

  const fetchOrders = () => {
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.orders && d.orders.length) setOrders(d.orders);
      })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
        setOrders(local);
      });
  };

  useEffect(() => {
    fetchOrders();
    const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
    if (local.length && orders.length === 0) setOrders(local);
  }, []);

  const updateStatus = async (orderId: string, status: string, orderData?: any) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status }),
      });
    } catch {}
    setOrders((prev) => prev.map((o) => (o.id === orderId || o.orderId === orderId ? { ...o, status } : o)));
    const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
    const updated = local.map((o: any) => (o.id === orderId || o.orderId === orderId ? { ...o, status } : o));
    localStorage.setItem("hoko_orders", JSON.stringify(updated));

    if (status === "shipped" && orderData) {
      setSteadfastMsg("🚚 Creating Steadfast consignment...");
      try {
        const res = await fetch("/api/steadfast/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            invoice: orderId,
            recipient_name: orderData.customer?.name,
            recipient_phone: orderData.customer?.phone,
            recipient_address: orderData.customer?.address,
            cod_amount: orderData.paymentMethod === "cod" ? orderData.total : 0,
            note: `HOKO Order ${orderId}`,
          }),
        });
        const data = await res.json();
        if (data.mock) setSteadfastMsg(`✅ Mock consignment! Tracking: ${data.consignment.tracking_code}`);
        else if (data.success) setSteadfastMsg(`✅ Steadfast consignment created!`);
        else setSteadfastMsg(`⚠️ ${data.error || "Steadfast error"}`);
        setTimeout(()=> setSteadfastMsg(""), 5000);
      } catch(e:any) { setSteadfastMsg("❌ "+e.message); setTimeout(()=> setSteadfastMsg(""), 4000); }
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      await fetch("/api/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus }),
      });
    } catch {}
    setOrders((prev) => prev.map((o) => (o.id === orderId || o.orderId === orderId ? { ...o, paymentStatus } : o)));
    const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
    const updated = local.map((o: any) => (o.id === orderId || o.orderId === orderId ? { ...o, paymentStatus } : o));
    localStorage.setItem("hoko_orders", JSON.stringify(updated));
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const displayOrders =
    filtered.length > 0
      ? filtered
      : [
          { id: "HOKO845123", orderId: "HOKO845123", customer: { name: "Rahim Ahmed", phone: "01700000001", email: "rahim@example.com", address: "Gulshan, Dhaka" }, total: 4590, subtotal: 4590, shipping: 0, status: "pending", paymentMethod: "cod", paymentStatus: "cod", createdAt: new Date().toISOString(), items: [{ name: "HOKO Air Max", quantity: 1, price: 4590, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80" }] },
          { id: "HOKO845122", orderId: "HOKO845122", customer: { name: "Fatima Khan", phone: "01700000002", email: "fatima@example.com", address: "Dhanmondi, Dhaka" }, total: 6890, subtotal: 6770, shipping: 120, status: "processing", paymentMethod: "bkash", paymentStatus: "pending", paymentDetails: { senderNumber: "01711111111", trxId: "9J7K2L8M9N" }, createdAt: new Date(Date.now() - 86400000).toISOString(), items: [{ name: "Formal Oxford", quantity: 1, price: 6890, image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=200&q=80" }] },
        ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-black dark:text-white">Orders • Payment & Delivery</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">See payment details (Sender Number, TrxID, Paid/COD) and update order/payment status</p>
      </div>

      {steadfastMsg && <div className="p-3 rounded-xl text-sm font-medium bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/30 text-green-700 dark:text-green-400">{steadfastMsg}</div>}

      <div className="flex gap-2 overflow-auto pb-2">
        {[
          { id: "all", label: "All Orders" },
          { id: "pending", label: "Pending" },
          { id: "processing", label: "Processing" },
          { id: "shipped", label: "Shipped" },
          { id: "delivered", label: "Delivered" },
          { id: "cancelled", label: "Cancelled" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap ${filter === f.id ? "bg-black dark:bg-white text-white dark:text-black" : "bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {displayOrders.map((o) => (
          <div key={o.id || o.orderId} className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-gray-100 dark:border-zinc-800">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="font-mono font-medium text-black dark:text-white">{o.id || o.orderId}</div>
                <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString()} • {o.paymentMethod?.toUpperCase() || "COD"} • <span className={`font-bold ${o.paymentStatus === "paid" ? "text-green-600" : o.paymentStatus === "cod" ? "text-amber-600" : "text-orange-600"}`}>{(o.paymentStatus || (o.paymentMethod === "cod" ? "COD" : "Pending")).toUpperCase()}</span></div>
                {o.couponCode && <div className="text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full inline-block mt-1 font-medium">Coupon: {o.couponCode} (-{formatPrice(o.discount || 0)})</div>}
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium uppercase ${o.status === "delivered" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30" : o.status === "shipped" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" : o.status === "processing" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400" : o.status === "cancelled" ? "bg-red-50 text-red-700" : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300"}`}>
                  {o.status}
                </span>
                <span className="text-xs font-bold text-black dark:text-white">{formatPrice(o.total)} {o.shipping !== undefined && <span className="font-normal text-gray-500"> (Ship {formatPrice(o.shipping)})</span>}</span>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Customer</div>
                <div className="font-medium text-sm mt-1 text-black dark:text-white">{o.customer?.name}</div>
                <div className="text-sm text-gray-600 dark:text-zinc-300">{o.customer?.phone}</div>
                <div className="text-xs text-gray-500">{o.customer?.address}</div>
                <div className="text-xs text-gray-400">{o.customer?.email}</div>
              </div>
              <div>
                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Items</div>
                <div className="space-y-2 mt-1">
                  {(o.items || []).map((it: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center text-sm">
                      <img src={it.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50 dark:bg-zinc-800" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium line-clamp-1 text-black dark:text-white truncate">{it.name}</div>
                        <div className="text-xs text-gray-500">Qty {it.quantity} • {formatPrice(it.price)} {it.size && `• Size ${it.size}`}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium tracking-wide text-gray-500 uppercase">Payment Details</div>
                <div className="mt-1 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Method:</span> <span className="font-medium uppercase text-black dark:text-white">{o.paymentMethod}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Status:</span> <span className={`font-bold ${o.paymentStatus === "paid" ? "text-green-600" : o.paymentStatus === "cod" ? "text-amber-600" : "text-orange-600"}`}>{o.paymentStatus || (o.paymentMethod === "cod" ? "COD" : "Pending")}</span></div>
                  {o.paymentDetails?.senderNumber && <div className="flex justify-between"><span className="text-gray-500">Sender:</span> <span className="font-mono font-medium text-black dark:text-white">{o.paymentDetails.senderNumber}</span></div>}
                  {o.paymentDetails?.trxId && <div className="flex justify-between"><span className="text-gray-500">TrxID:</span> <span className="font-mono font-medium text-black dark:text-white">{o.paymentDetails.trxId}</span></div>}
                  {!o.paymentDetails?.senderNumber && o.paymentMethod !== "cod" && <div className="text-xs text-amber-600">No sender info yet</div>}
                  {o.paymentMethod === "cod" && <div className="text-xs text-gray-500">Cash on Delivery - Collect on delivery</div>}
                </div>
                <div className="mt-3 flex gap-2">
                  <button onClick={() => updatePaymentStatus(o.id || o.orderId, "paid")} className={`flex-1 py-1.5 rounded-full text-xs font-bold border ${o.paymentStatus === "paid" ? "bg-green-600 text-white border-green-600" : "bg-white dark:bg-zinc-900 hover:bg-green-50 border-gray-200 dark:border-zinc-700"}`}>Mark Paid</button>
                  <button onClick={() => updatePaymentStatus(o.id || o.orderId, "pending")} className={`flex-1 py-1.5 rounded-full text-xs font-bold border ${o.paymentStatus === "pending" ? "bg-amber-500 text-white border-amber-500" : "bg-white dark:bg-zinc-900 hover:bg-amber-50"}`}>Pending</button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5 border-t border-gray-100 dark:border-zinc-800 pt-4">
              <span className="text-xs font-medium self-center text-black dark:text-white">Order Status:</span>
              {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(o.id || o.orderId, s, o)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize border ${o.status === s ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 border-gray-200 dark:border-zinc-700"}`}
                >
                  {s} {s==="shipped" ? "🚚" : ""}
                </button>
              ))}
              <a href={`tel:${o.customer?.phone}`} className="ml-auto bg-black dark:bg-white text-white dark:text-black px-4 py-1.5 rounded-full text-xs font-medium">
                Call Customer
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
