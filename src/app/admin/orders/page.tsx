"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, ChevronRight, CircleDollarSign, Clock3, CreditCard, Mail, MapPin, Package, Phone, RefreshCw, Search, Truck, X, XCircle } from "lucide-react";

type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
type PaymentStatus = "pending" | "paid" | "failed" | "cod";
type OrderItem = { name: string; quantity: number; price: number; size?: number; image?: string };
type Order = { id?: string; _id?: string; orderId?: string; customer?: { name?: string; phone?: string; email?: string; address?: string; city?: string }; total: number; subtotal?: number; shipping?: number; discount?: number; couponCode?: string; status?: OrderStatus; paymentMethod?: string; paymentStatus?: PaymentStatus; paymentDetails?: { senderNumber?: string; trxId?: string }; createdAt?: string; items?: OrderItem[] };

const statusMeta: Record<OrderStatus, { label: string; icon: typeof Clock3; className: string }> = {
  pending: { label: "Pending", icon: Clock3, className: "bg-amber-50 text-amber-700 ring-amber-100 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900" },
  processing: { label: "Processing", icon: Package, className: "bg-violet-50 text-violet-700 ring-violet-100 dark:bg-violet-950/40 dark:text-violet-300 dark:ring-violet-900" },
  shipped: { label: "Shipped", icon: Truck, className: "bg-blue-50 text-blue-700 ring-blue-100 dark:bg-blue-950/40 dark:text-blue-300 dark:ring-blue-900" },
  delivered: { label: "Delivered", icon: CheckCircle2, className: "bg-emerald-50 text-emerald-700 ring-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900" },
  cancelled: { label: "Cancelled", icon: XCircle, className: "bg-rose-50 text-rose-700 ring-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:ring-rose-900" },
};

const statuses: Array<{ id: "all" | OrderStatus; label: string }> = [{ id: "all", label: "All orders" }, ...Object.entries(statusMeta).map(([id, value]) => ({ id: id as OrderStatus, label: value.label }))];
const orderKey = (order: Order) => order.orderId || order.id || order._id || "";
const orderStatus = (order: Order): OrderStatus => order.status || "pending";

function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = statusMeta[status]; const Icon = meta.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${meta.className}`}><Icon size={13} />{meta.label}</span>;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | OrderStatus>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState("");
  const [notice, setNotice] = useState("");

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/orders");
      const data = await response.json();
      if (!response.ok) throw new Error("Could not load orders");
      setOrders(data.orders || []);
    } catch {
      try { setOrders(JSON.parse(localStorage.getItem("hoko_orders") || "[]")); } catch { setOrders([]); }
    } finally { setLoading(false); }
  }, []);

  // Initial data load is intentionally triggered once when the workspace opens.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const visibleOrders = useMemo(() => orders.filter((order) => {
    const haystack = [orderKey(order), order.customer?.name, order.customer?.phone, order.customer?.email].join(" ").toLowerCase();
    return (filter === "all" || orderStatus(order) === filter) && haystack.includes(query.toLowerCase().trim());
  }), [orders, filter, query]);

  const metrics = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((order) => orderStatus(order) === "pending").length,
    delivery: orders.filter((order) => orderStatus(order) === "shipped").length,
    revenue: orders.filter((order) => orderStatus(order) !== "cancelled").reduce((sum, order) => sum + (Number(order.total) || 0), 0),
  }), [orders]);

  const updateOrder = async (order: Order, changes: Partial<Pick<Order, "status" | "paymentStatus">>) => {
    const id = orderKey(order); if (!id) return;
    setUpdating(`${id}-${Object.keys(changes)[0]}`);
    try {
      const response = await fetch("/api/orders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderId: id, ...changes }) });
      if (!response.ok) throw new Error("Update failed");
      const apply = (item: Order) => orderKey(item) === id ? { ...item, ...changes } : item;
      setOrders((current) => current.map(apply)); setSelected((current) => current && orderKey(current) === id ? apply(current) : current);
      const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
      localStorage.setItem("hoko_orders", JSON.stringify(local.map(apply)));
      setNotice("Order updated successfully"); setTimeout(() => setNotice(""), 3000);
    } catch { setNotice("Could not update this order. Please try again."); setTimeout(() => setNotice(""), 4000); }
    finally { setUpdating(""); }
  };

  return <div className="mx-auto max-w-[1500px] space-y-6">
    <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">Commerce operations</p><h2 className="mt-1 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">Order management</h2><p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">Review payments, fulfil orders, and keep customers informed.</p></div>
      <button onClick={fetchOrders} disabled={loading} className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 text-sm font-bold text-zinc-800 shadow-sm transition hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"><RefreshCw size={16} className={loading ? "animate-spin" : ""} />Refresh orders</button>
    </div>
    {notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">{notice}</div>}

    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {[{ label: "Total orders", value: metrics.total.toString(), icon: Package, iconClass: "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" }, { label: "Awaiting action", value: metrics.pending.toString(), icon: Clock3, iconClass: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" }, { label: "In delivery", value: metrics.delivery.toString(), icon: Truck, iconClass: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" }, { label: "Order value", value: formatPrice(metrics.revenue), icon: CircleDollarSign, iconClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" }].map(({ label, value, icon: Icon, iconClass }) => <div key={label} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"><div className="flex items-start justify-between"><p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p><span className={`grid h-9 w-9 place-items-center rounded-xl ${iconClass}`}><Icon size={18} /></span></div><p className="mt-4 text-2xl font-black tracking-tight text-zinc-950 dark:text-white">{value}</p></div>)}
    </div>

    <section className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex flex-col gap-4 border-b border-zinc-100 p-4 lg:flex-row lg:items-center lg:justify-between dark:border-zinc-800">
        <div className="relative w-full lg:max-w-md"><Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order, customer, phone or email" className="h-10 w-full rounded-xl border border-zinc-200 bg-zinc-50 pl-10 pr-3 text-sm outline-none transition focus:border-zinc-500 focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-950 dark:focus:ring-zinc-700" /></div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">{statuses.map((item) => <button key={item.id} onClick={() => setFilter(item.id)} className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-bold transition ${filter === item.id ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}>{item.label}<span className="ml-1.5 opacity-70">{item.id === "all" ? orders.length : orders.filter((order) => orderStatus(order) === item.id).length}</span></button>)}</div>
      </div>
      <div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="bg-zinc-50 text-[11px] font-bold uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-950/50"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Items</th><th className="px-5 py-4">Payment</th><th className="px-5 py-4">Total</th><th className="px-5 py-4">Fulfilment</th><th className="px-5 py-4"><span className="sr-only">Open</span></th></tr></thead><tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">{loading ? <tr><td colSpan={7} className="px-5 py-16 text-center text-sm text-zinc-500"><RefreshCw className="mx-auto mb-2 animate-spin" size={20} />Loading orders…</td></tr> : visibleOrders.length === 0 ? <tr><td colSpan={7} className="px-5 py-16 text-center"><Package className="mx-auto mb-3 text-zinc-300" size={30} /><p className="font-bold text-zinc-800 dark:text-zinc-100">No orders found</p><p className="mt-1 text-sm text-zinc-500">Try another filter or search term.</p></td></tr> : visibleOrders.map((order) => <OrderRow key={orderKey(order)} order={order} onOpen={() => setSelected(order)} />)}</tbody></table></div>
      <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500 dark:border-zinc-800"><span>Showing {visibleOrders.length} of {orders.length} orders</span><span>Latest orders appear first</span></div>
    </section>
    {selected && <OrderDrawer order={selected} updating={updating} onClose={() => setSelected(null)} onUpdate={updateOrder} />}
  </div>;
}

function OrderRow({ order, onOpen }: { order: Order; onOpen: () => void }) { const id = orderKey(order); const items = order.items || []; const payment = order.paymentStatus || (order.paymentMethod === "cod" ? "cod" : "pending"); return <tr className="group transition hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40"><td className="px-5 py-4"><p className="font-mono text-sm font-bold text-zinc-900 dark:text-white">#{id}</p><p className="mt-1 text-xs text-zinc-500">{order.createdAt ? new Intl.DateTimeFormat("en-BD", { dateStyle: "medium", timeStyle: "short" }).format(new Date(order.createdAt)) : "—"}</p></td><td className="px-5 py-4"><p className="text-sm font-bold text-zinc-900 dark:text-white">{order.customer?.name || "Guest customer"}</p><p className="mt-1 text-xs text-zinc-500">{order.customer?.phone || "No phone"}</p></td><td className="px-5 py-4"><p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{items.length} item{items.length === 1 ? "" : "s"}</p><p className="mt-1 max-w-[160px] truncate text-xs text-zinc-500">{items.map((item) => item.name).join(", ") || "—"}</p></td><td className="px-5 py-4"><p className="text-xs font-bold uppercase text-zinc-700 dark:text-zinc-200">{order.paymentMethod || "COD"}</p><p className={`mt-1 text-xs font-semibold ${payment === "paid" ? "text-emerald-600" : payment === "cod" ? "text-amber-600" : "text-zinc-500"}`}>{payment === "cod" ? "Cash on delivery" : payment}</p></td><td className="px-5 py-4"><p className="text-sm font-black text-zinc-950 dark:text-white">{formatPrice(order.total || 0)}</p>{order.discount ? <p className="mt-1 text-xs font-medium text-emerald-600">−{formatPrice(order.discount)} discount</p> : null}</td><td className="px-5 py-4"><StatusBadge status={orderStatus(order)} /></td><td className="px-5 py-4 text-right"><button onClick={onOpen} className="inline-flex h-9 items-center gap-1 rounded-lg border border-zinc-200 px-3 text-xs font-bold text-zinc-700 transition hover:border-zinc-400 hover:bg-white dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800">Manage <ChevronRight size={15} /></button></td></tr>; }

function OrderDrawer({ order, updating, onClose, onUpdate }: { order: Order; updating: string; onClose: () => void; onUpdate: (order: Order, changes: Partial<Pick<Order, "status" | "paymentStatus">>) => void }) { const id = orderKey(order); const payment = order.paymentStatus || (order.paymentMethod === "cod" ? "cod" : "pending"); return <div className="fixed inset-0 z-50 flex justify-end bg-zinc-950/40 p-0 backdrop-blur-[1px]" onMouseDown={onClose}><aside onMouseDown={(event) => event.stopPropagation()} className="flex h-full w-full max-w-xl flex-col bg-white shadow-2xl dark:bg-zinc-950"><div className="flex items-start justify-between border-b border-zinc-200 p-6 dark:border-zinc-800"><div><p className="text-xs font-bold uppercase tracking-[0.15em] text-zinc-500">Order details</p><h3 className="mt-1 font-mono text-lg font-black text-zinc-950 dark:text-white">#{id}</h3><div className="mt-2"><StatusBadge status={orderStatus(order)} /></div></div><button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800"><X size={19} /></button></div><div className="flex-1 space-y-6 overflow-y-auto p-6"><div className="grid grid-cols-2 gap-3"><Info icon={Phone} label="Phone" value={order.customer?.phone || "—"} /><Info icon={Mail} label="Email" value={order.customer?.email || "—"} /><div className="col-span-2"><Info icon={MapPin} label="Delivery address" value={[order.customer?.address, order.customer?.city].filter(Boolean).join(", ") || "—"} /></div></div><section><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Items</p><div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">{(order.items || []).map((item, index) => <div key={`${item.name}-${index}`} className="flex gap-3 border-b border-zinc-100 p-3 last:border-0 dark:border-zinc-800">{item.image ? <img src={item.image} alt="" className="h-12 w-12 rounded-lg object-cover" /> : <span className="grid h-12 w-12 place-items-center rounded-lg bg-zinc-100 dark:bg-zinc-800"><Package size={18} /></span>}<div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-zinc-900 dark:text-white">{item.name}</p><p className="mt-1 text-xs text-zinc-500">Qty {item.quantity}{item.size ? ` · Size ${item.size}` : ""}</p></div><p className="text-sm font-bold text-zinc-900 dark:text-white">{formatPrice(item.price * item.quantity)}</p></div>)}</div></section><section className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-900"><div className="flex justify-between text-sm text-zinc-500"><span>Subtotal</span><span>{formatPrice(order.subtotal ?? order.total ?? 0)}</span></div><div className="mt-2 flex justify-between text-sm text-zinc-500"><span>Delivery</span><span>{formatPrice(order.shipping || 0)}</span></div>{order.discount ? <div className="mt-2 flex justify-between text-sm text-emerald-600"><span>Discount {order.couponCode ? `(${order.couponCode})` : ""}</span><span>−{formatPrice(order.discount)}</span></div> : null}<div className="mt-3 flex justify-between border-t border-zinc-200 pt-3 text-base font-black text-zinc-950 dark:border-zinc-700 dark:text-white"><span>Total</span><span>{formatPrice(order.total || 0)}</span></div></section><section><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Payment</p><div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"><div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-zinc-100 dark:bg-zinc-800"><CreditCard size={17} /></span><div><p className="text-sm font-bold uppercase text-zinc-900 dark:text-white">{order.paymentMethod || "COD"}</p><p className="text-xs text-zinc-500">{payment === "cod" ? "Collect at delivery" : `Payment ${payment}`}</p></div></div>{order.paymentDetails?.senderNumber && <p className="mt-3 text-xs text-zinc-500">Sender: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{order.paymentDetails.senderNumber}</span></p>}{order.paymentDetails?.trxId && <p className="mt-1 text-xs text-zinc-500">Trx ID: <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">{order.paymentDetails.trxId}</span></p>}<div className="mt-4 flex gap-2"><button disabled={Boolean(updating)} onClick={() => onUpdate(order, { paymentStatus: "paid" })} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${payment === "paid" ? "bg-emerald-600 text-white" : "border border-zinc-200 hover:bg-emerald-50 dark:border-zinc-700 dark:hover:bg-emerald-950/30"}`}>Mark paid</button><button disabled={Boolean(updating)} onClick={() => onUpdate(order, { paymentStatus: "pending" })} className={`flex-1 rounded-lg px-3 py-2 text-xs font-bold ${payment === "pending" ? "bg-amber-500 text-white" : "border border-zinc-200 hover:bg-amber-50 dark:border-zinc-700 dark:hover:bg-amber-950/30"}`}>Mark pending</button></div></div></section><section><p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-zinc-500">Fulfilment status</p><div className="grid grid-cols-2 gap-2">{(Object.keys(statusMeta) as OrderStatus[]).map((status) => <button key={status} disabled={Boolean(updating)} onClick={() => onUpdate(order, { status })} className={`rounded-xl border px-3 py-2.5 text-left text-xs font-bold transition ${orderStatus(order) === status ? "border-zinc-950 bg-zinc-950 text-white dark:border-white dark:bg-white dark:text-zinc-950" : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-900"}`}>{statusMeta[status].label}</button>)}</div></section></div><div className="border-t border-zinc-200 p-5 dark:border-zinc-800"><a href={`tel:${order.customer?.phone || ""}`} className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 text-sm font-bold text-white dark:bg-white dark:text-zinc-950"><Phone size={16} />Call customer</a></div></aside></div>; }
function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) { return <div className="flex gap-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-800"><Icon size={16} className="mt-0.5 shrink-0 text-zinc-400" /><div className="min-w-0"><p className="text-[11px] font-bold uppercase tracking-wide text-zinc-500">{label}</p><p className="mt-1 break-words text-sm font-semibold text-zinc-900 dark:text-zinc-100">{value}</p></div></div>; }
