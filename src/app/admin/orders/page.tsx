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

    // Steadfast auto-create when shipped
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
        if (data.mock) setSteadfastMsg(`✅ Mock consignment created! Tracking: ${data.consignment.tracking_code} (Configure Steadfast in Settings for real)`);
        else if (data.success) setSteadfastMsg(`✅ Steadfast consignment created! ${JSON.stringify(data.data).slice(0, 100)}`);
        else setSteadfastMsg(`⚠️ ${data.error || "Steadfast error - check API keys"}`);
        setTimeout(()=> setSteadfastMsg(""), 5000);
      } catch(e:any) { setSteadfastMsg("❌ "+e.message); setTimeout(()=> setSteadfastMsg(""), 4000); }
    }
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const displayOrders =
    filtered.length > 0
      ? filtered
      : [
          { id: "HOKO845123", orderId: "HOKO845123", customer: { name: "Rahim Ahmed", phone: "01700000001", address: "Gulshan, Dhaka" }, total: 4590, status: "pending", paymentMethod: "cod", createdAt: new Date().toISOString(), items: [{ name: "HOKO Air Max", quantity: 1, price: 4590, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80" }] },
          { id: "HOKO845122", orderId: "HOKO845122", customer: { name: "Fatima Khan", phone: "01700000002", address: "Dhanmondi, Dhaka" }, total: 6890, status: "processing", paymentMethod: "bkash", createdAt: new Date(Date.now() - 86400000).toISOString(), items: [{ name: "Formal Oxford", quantity: 1, price: 6890, image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=200&q=80" }] },
        ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Orders • Steadfast Integrated</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Status "Shipped" korle auto Steadfast e consignment jabe • Customer live track korte parbe</p>
      </div>

      {steadfastMsg && <div className="p-3 rounded-xl text-sm font-bold bg-green-50 border border-green-200 text-green-700">{steadfastMsg}</div>}

      <div className="flex gap-2 overflow-auto pb-2">
        {[
          { id: "all", label: "All Orders" },
          { id: "pending", label: "Pending" },
          { id: "processing", label: "Processing" },
          { id: "shipped", label: "Shipped" },
          { id: "delivered", label: "Delivered" },
          { id: "cancelled", label: "Cancelled" },
        ].map((f) => (
          <button key={f.id} onClick={() => setFilter(f.id)} className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap ${filter === f.id ? "bg-black text-white" : "bg-white dark:bg-zinc-900 border hover:bg-gray-50"}`}>
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {displayOrders.map((o) => (
          <div key={o.id || o.orderId} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border">
            <div className="flex flex-wrap justify-between gap-4">
              <div>
                <div className="font-mono font-black">{o.id || o.orderId}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">{new Date(o.createdAt).toLocaleString()} • {o.paymentMethod?.toUpperCase() || "COD"}</div>
                {o.couponCode && <div className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full inline-block mt-1 font-bold">Coupon: {o.couponCode} (-{formatPrice(o.discount || 0)})</div>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase h-fit ${o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "shipped" ? "bg-blue-100 text-blue-700" : o.status === "processing" ? "bg-amber-100 text-amber-700" : o.status === "cancelled" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"}`}>
                {o.status}
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-zinc-400">CUSTOMER</div>
                <div className="font-bold text-sm mt-1">{o.customer?.name}</div>
                <div className="text-sm text-gray-600 dark:text-zinc-300">{o.customer?.phone}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">{o.customer?.address}</div>
                <div className="text-xs text-gray-400">{o.customer?.email}</div>
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-zinc-400">ITEMS</div>
                <div className="space-y-2 mt-1">
                  {(o.items || []).map((it: any, i: number) => (
                    <div key={i} className="flex gap-2 items-center text-sm">
                      <img src={it.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-50 dark:bg-zinc-800" />
                      <div className="flex-1">
                        <div className="font-medium line-clamp-1">{it.name}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">Qty {it.quantity} • {formatPrice(it.price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-500 dark:text-zinc-400">TOTAL</div>
                <div className="font-black text-xl mt-1">{formatPrice(o.total)}</div>
                {o.discount > 0 && <div className="text-xs text-green-600 font-bold">Discount: -{formatPrice(o.discount)}</div>}
                <div className="text-xs text-gray-500 dark:text-zinc-400">Payment: {o.paymentMethod}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mt-5 border-t pt-4">
              <span className="text-xs font-bold self-center">Update Status:</span>
              {["pending", "processing", "shipped", "delivered", "cancelled"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(o.id || o.orderId, s, o)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold capitalize border ${o.status === s ? "bg-black text-white border-black" : "bg-white dark:bg-zinc-900 hover:bg-gray-50"}`}
                >
                  {s} {s==="shipped" ? "🚚" : ""}
                </button>
              ))}
              <a href={`tel:${o.customer?.phone}`} className="ml-auto bg-amber-500 text-black dark:text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-amber-600">
                Call Customer
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}