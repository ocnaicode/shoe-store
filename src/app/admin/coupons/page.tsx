"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [flashSale, setFlashSale] = useState<any>({ enabled: false, title: "⚡ FLASH SALE - 30% OFF!", discountPercent: 30, endTime: new Date(Date.now() + 86400000).toISOString().slice(0,16), productIds: "" });
  const [form, setForm] = useState({ code: "", discountType: "percent", discountValue: "", minOrder: "", maxDiscount: "", expiry: new Date(Date.now() + 7*86400000).toISOString().slice(0,16), description: "" });
  const [loading, setLoading] = useState(false);

  const fetchCoupons = () => {
    fetch("/api/coupons").then(r=>r.json()).then(d=> setCoupons(d.coupons||[]));
    fetch("/api/settings").then(r=>r.json()).then(d=> {
      if(d.flashSale) setFlashSale({
        enabled: d.flashSale.enabled,
        title: d.flashSale.title,
        discountPercent: d.flashSale.discountPercent,
        endTime: d.flashSale.endTime ? new Date(d.flashSale.endTime).toISOString().slice(0,16) : new Date(Date.now() + 86400000).toISOString().slice(0,16),
        productIds: (d.flashSale.productIds||[]).join(", "),
      });
    });
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, expiry: new Date(form.expiry).toISOString() }),
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error);
      setForm({ code: "", discountType: "percent", discountValue: "", minOrder: "", maxDiscount: "", expiry: new Date(Date.now() + 7*86400000).toISOString().slice(0,16), description: "" });
      fetchCoupons();
      alert("✅ Coupon created!");
    } catch(err:any) { alert("❌ "+err.message); }
    setLoading(false);
  };

  const handleDelete = async (code: string) => {
    if(!confirm(`Delete ${code}?`)) return;
    await fetch(`/api/coupons?code=${code}`, { method: "DELETE" });
    fetchCoupons();
  };

  const toggleCoupon = async (code: string, isActive: boolean) => {
    await fetch("/api/coupons", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ code, isActive: !isActive }) });
    fetchCoupons();
  };

  const saveFlashSale = async () => {
    await fetch("/api/settings", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ flashSale: {
        enabled: flashSale.enabled,
        title: flashSale.title,
        discountPercent: Number(flashSale.discountPercent),
        endTime: new Date(flashSale.endTime).toISOString(),
        productIds: flashSale.productIds ? flashSale.productIds.split(",").map((s:string)=>s.trim()).filter(Boolean) : [],
      }})
    });
    alert("✅ Flash Sale settings saved! Home page e timer show hobe.");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Coupons & Flash Sale 🎟️⚡</h2>
        <p className="text-sm text-gray-500">Admin theke sob control - Coupon create + Flash Sale timer</p>
      </div>

      {/* Flash Sale */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-lg">⚡ Flash Sale Timer</h3>
          <label className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-bold text-sm cursor-pointer">
            <input type="checkbox" checked={flashSale.enabled} onChange={(e)=> setFlashSale({...flashSale, enabled: e.target.checked})} className="accent-black" />
            {flashSale.enabled ? "Enabled ✅" : "Disabled"}
          </label>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <label>
            <span className="text-xs font-bold opacity-90">Title</span>
            <input value={flashSale.title} onChange={(e)=> setFlashSale({...flashSale, title:e.target.value})} className="w-full mt-1 rounded-xl px-4 py-2 text-sm text-black" />
          </label>
          <label>
            <span className="text-xs font-bold opacity-90">Discount %</span>
            <input type="number" value={flashSale.discountPercent} onChange={(e)=> setFlashSale({...flashSale, discountPercent:e.target.value})} className="w-full mt-1 rounded-xl px-4 py-2 text-sm text-black" />
          </label>
          <label>
            <span className="text-xs font-bold opacity-90">End Time</span>
            <input type="datetime-local" value={flashSale.endTime} onChange={(e)=> setFlashSale({...flashSale, endTime:e.target.value})} className="w-full mt-1 rounded-xl px-4 py-2 text-sm text-black" />
          </label>
          <label className="md:col-span-3">
            <span className="text-xs font-bold opacity-90">Product IDs (comma separated, blank = all products)</span>
            <input value={flashSale.productIds} onChange={(e)=> setFlashSale({...flashSale, productIds:e.target.value})} placeholder="1,2,3 or leave blank" className="w-full mt-1 rounded-xl px-4 py-2 text-sm text-black" />
          </label>
        </div>
        <button onClick={saveFlashSale} className="mt-4 bg-black text-white font-bold px-6 py-2.5 rounded-full hover:bg-zinc-800">💾 Save Flash Sale</button>
        <p className="text-xs opacity-80 mt-2">Enable korle Home page er top e countdown timer + Product page e discount show hobe.</p>
      </div>

      {/* Create Coupon */}
      <div className="bg-white rounded-2xl p-6 border">
        <h3 className="font-black">Create New Coupon</h3>
        <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-4 mt-4">
          <label>
            <span className="text-xs font-bold">Code *</span>
            <input required value={form.code} onChange={(e)=> setForm({...form, code:e.target.value.toUpperCase()})} placeholder="EID2026" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm uppercase" />
          </label>
          <label>
            <span className="text-xs font-bold">Discount Type</span>
            <select value={form.discountType} onChange={(e)=> setForm({...form, discountType:e.target.value})} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm bg-white">
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (৳)</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-bold">Value *</span>
            <input required type="number" value={form.discountValue} onChange={(e)=> setForm({...form, discountValue:e.target.value})} placeholder="15" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          <label>
            <span className="text-xs font-bold">Min Order (৳)</span>
            <input type="number" value={form.minOrder} onChange={(e)=> setForm({...form, minOrder:e.target.value})} placeholder="3000" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          <label>
            <span className="text-xs font-bold">Max Discount (৳, for %)</span>
            <input type="number" value={form.maxDiscount} onChange={(e)=> setForm({...form, maxDiscount:e.target.value})} placeholder="1000" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          <label>
            <span className="text-xs font-bold">Expiry *</span>
            <input required type="datetime-local" value={form.expiry} onChange={(e)=> setForm({...form, expiry:e.target.value})} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          <label className="md:col-span-3">
            <span className="text-xs font-bold">Description</span>
            <input value={form.description} onChange={(e)=> setForm({...form, description:e.target.value})} placeholder="Eid Special 15% off" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          <button disabled={loading} type="submit" className="md:col-span-3 bg-black text-white font-black py-3 rounded-full hover:bg-zinc-800 disabled:opacity-50">
            {loading ? "Creating..." : "🎟️ Create Coupon"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-black">All Coupons ({coupons.length})</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="text-left p-4">Code</th>
                <th className="text-left p-4">Discount</th>
                <th className="text-left p-4">Min Order</th>
                <th className="text-left p-4">Expiry</th>
                <th className="text-left p-4">Usage</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c)=> (
                <tr key={c.code} className="border-t">
                  <td className="p-4 font-mono font-black">{c.code}</td>
                  <td className="p-4 font-bold">{c.discountType==="percent" ? `${c.discountValue}%` : formatPrice(c.discountValue)} <span className="text-xs text-gray-500">{c.description}</span></td>
                  <td className="p-4">{formatPrice(c.minOrder)}</td>
                  <td className="p-4 text-xs">{new Date(c.expiry).toLocaleDateString()}</td>
                  <td className="p-4">{c.usedCount || 0} / {c.usageLimit}</td>
                  <td className="p-4"><button onClick={()=> toggleCoupon(c.code, c.isActive)} className={`px-3 py-1 rounded-full text-xs font-bold ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{c.isActive ? "Active" : "Inactive"}</button></td>
                  <td className="p-4 flex gap-2">
                    <button onClick={()=> navigator.clipboard.writeText(c.code)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-black hover:text-white">📋</button>
                    <button onClick={()=> handleDelete(c.code)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-red-500 hover:text-white">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
