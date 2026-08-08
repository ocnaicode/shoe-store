"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [flashSale, setFlashSale] = useState<any>({ enabled: false, title: "⚡ FLASH SALE - 30% OFF!", discountPercent: 30, endTime: new Date(Date.now() + 86400000).toISOString().slice(0,16), productIds: [] as string[] });
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ code: "", discountType: "percent", discountValue: "", minOrder: "", maxDiscount: "", expiry: new Date(Date.now() + 7*86400000).toISOString().slice(0,16), description: "" });
  const [loading, setLoading] = useState(false);

  const fetchCoupons = () => {
    fetch("/api/coupons").then(r=>r.json()).then(d=> setCoupons(d.coupons||[]));
    fetch("/api/products").then(r=>r.json()).then(d=> setProducts(d.products||[]));
    fetch("/api/settings").then(r=>r.json()).then(d=> {
      if(d.flashSale) setFlashSale({
        enabled: d.flashSale.enabled,
        title: d.flashSale.title,
        discountPercent: d.flashSale.discountPercent,
        endTime: d.flashSale.endTime ? new Date(d.flashSale.endTime).toISOString().slice(0,16) : new Date(Date.now() + 86400000).toISOString().slice(0,16),
        productIds: d.flashSale.productIds||[],
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
        body: JSON.stringify({ ...form, discountValue: Number(form.discountValue), minOrder: Number(form.minOrder)||0, maxDiscount: form.maxDiscount?Number(form.maxDiscount):undefined, expiry: new Date(form.expiry).toISOString() }),
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
        productIds: flashSale.productIds,
      }})
    });
    alert("✅ Flash Sale saved! Home & Product page e show hobe.");
  };

  const toggleFlashProduct = (id: string) => {
    setFlashSale((prev:any)=> ({
      ...prev,
      productIds: prev.productIds.includes(id) ? prev.productIds.filter((p:string)=>p!==id) : [...prev.productIds, id]
    }));
  };

  const filteredProducts = products.filter(p=> 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.slug.toLowerCase().includes(search.toLowerCase()) ||
    p.brand.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Coupons & Flash Sale 🎟️⚡</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Coupon create + Flash Sale with product search select</p>
      </div>

      {/* Flash Sale */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white">⚡ Flash Sale Timer</h3>
          <label className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full font-medium text-sm cursor-pointer">
            <input type="checkbox" checked={flashSale.enabled} onChange={(e)=> setFlashSale({...flashSale, enabled: e.target.checked})} className="accent-black" />
            {flashSale.enabled ? "Enabled ✅" : "Disabled"}
          </label>
        </div>
        <div className="grid md:grid-cols-3 gap-4 mt-4">
          <label>
            <span className="text-xs font-medium opacity-90">Title</span>
            <input value={flashSale.title} onChange={(e)=> setFlashSale({...flashSale, title:e.target.value})} className="w-full mt-1 rounded-xl px-4 py-2 text-sm text-black" />
          </label>
          <label>
            <span className="text-xs font-medium opacity-90">Discount %</span>
            <input type="number" value={flashSale.discountPercent} onChange={(e)=> setFlashSale({...flashSale, discountPercent:e.target.value})} className="w-full mt-1 rounded-xl px-4 py-2 text-sm text-black" />
          </label>
          <label>
            <span className="text-xs font-medium opacity-90">End Time</span>
            <input type="datetime-local" value={flashSale.endTime} onChange={(e)=> setFlashSale({...flashSale, endTime:e.target.value})} className="w-full mt-1 rounded-xl px-4 py-2 text-sm text-black" />
          </label>
        </div>

        <div className="mt-4 bg-white/10 backdrop-blur rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Select Products for Flash Sale (Search & Select)</span>
            <span className="text-xs bg-white text-red-600 px-2.5 py-1 rounded-full font-bold">{flashSale.productIds.length} selected {flashSale.productIds.length===0 && "(All products)"}</span>
          </div>
          <input value={search} onChange={e=> setSearch(e.target.value)} placeholder="Search by name, brand, slug... e.g. HOKO, Nike, sneakers" className="w-full mt-3 rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-gray-400 focus:outline-none" />
          <div className="mt-3 max-h-48 overflow-auto bg-white rounded-xl p-2 space-y-1">
            {filteredProducts.length===0 ? <p className="text-center text-gray-400 text-sm py-4">No products found</p> : filteredProducts.slice(0,10).map((p:any)=> (
              <label key={p._id || p.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer">
                <input type="checkbox" checked={flashSale.productIds.includes(p._id || p.id)} onChange={()=> toggleFlashProduct(p._id || p.id)} className="accent-red-500" />
                <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-black truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">{p.brand} • {p.category} • ৳{p.price}</div>
                </div>
                {flashSale.productIds.includes(p._id || p.id) && <span className="text-green-600 font-bold text-xs">✓</span>}
              </label>
            ))}
          </div>
          {flashSale.productIds.length>0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {flashSale.productIds.map((id:string)=>{
                const p=products.find((x:any)=> (x._id||x.id)===id);
                return <span key={id} className="bg-white text-black text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">{p?.name?.slice(0,15)}... <button onClick={()=> toggleFlashProduct(id)} className="w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-xs">×</button></span>
              })}
              <button onClick={()=> setFlashSale({...flashSale, productIds: []})} className="text-xs underline text-white/80 hover:text-white">Clear (All products)</button>
            </div>
          )}
        </div>

        <button onClick={saveFlashSale} className="mt-4 bg-black text-white font-medium px-6 py-2.5 rounded-full hover:bg-zinc-800">💾 Save Flash Sale</button>
        <p className="text-xs opacity-80 mt-2">Enable korle Home top e countdown + Selected products e discount show hobe. Blank = all products.</p>
      </div>

      {/* Create Coupon */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-200 dark:border-zinc-800">
        <h3 className="font-medium text-black dark:text-white">Create New Coupon</h3>
        <form onSubmit={handleCreate} className="grid md:grid-cols-3 gap-4 mt-4">
          <label>
            <span className="text-xs font-medium">Code *</span>
            <input required value={form.code} onChange={(e)=> setForm({...form, code:e.target.value.toUpperCase()})} placeholder="EID2026" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm uppercase bg-white dark:bg-zinc-900 text-black dark:text-white" />
          </label>
          <label>
            <span className="text-xs font-medium">Discount Type</span>
            <select value={form.discountType} onChange={(e)=> setForm({...form, discountType:e.target.value})} className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-zinc-900 text-black dark:text-white">
              <option value="percent">Percent (%)</option>
              <option value="fixed">Fixed (৳)</option>
            </select>
          </label>
          <label>
            <span className="text-xs font-medium">Value *</span>
            <input required type="number" value={form.discountValue} onChange={(e)=> setForm({...form, discountValue:e.target.value})} placeholder="15" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm" />
          </label>
          <label>
            <span className="text-xs font-medium">Min Order (৳)</span>
            <input type="number" value={form.minOrder} onChange={(e)=> setForm({...form, minOrder:e.target.value})} placeholder="3000" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm" />
          </label>
          <label>
            <span className="text-xs font-medium">Max Discount (৳, for %)</span>
            <input type="number" value={form.maxDiscount} onChange={(e)=> setForm({...form, maxDiscount:e.target.value})} placeholder="1000" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm" />
          </label>
          <label>
            <span className="text-xs font-medium">Expiry *</span>
            <input required type="datetime-local" value={form.expiry} onChange={(e)=> setForm({...form, expiry:e.target.value})} className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm" />
          </label>
          <label className="md:col-span-3">
            <span className="text-xs font-medium">Description</span>
            <input value={form.description} onChange={(e)=> setForm({...form, description:e.target.value})} placeholder="Eid Special 15% off" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-4 py-2.5 text-sm" />
          </label>
          <button disabled={loading} type="submit" className="md:col-span-3 bg-black dark:bg-white text-white dark:text-black font-medium py-3 rounded-full hover:bg-zinc-800 disabled:opacity-50">
            {loading ? "Creating..." : "🎟️ Create Coupon"}
          </button>
        </form>
      </div>

      {/* List */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800">
          <h3 className="font-medium text-black dark:text-white">All Coupons ({coupons.length})</h3>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800 text-xs text-gray-500 dark:text-zinc-400">
              <tr>
                <th className="text-left p-3 font-medium">Code</th>
                <th className="text-left p-3 font-medium">Discount</th>
                <th className="text-left p-3 font-medium">Min Order</th>
                <th className="text-left p-3 font-medium">Expiry</th>
                <th className="text-left p-3 font-medium">Usage</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {coupons.map((c)=> (
                <tr key={c.code} className="border-t border-gray-100 dark:border-zinc-800">
                  <td className="p-3 font-mono font-medium text-black dark:text-white">{c.code}</td>
                  <td className="p-3 font-medium text-black dark:text-white">{c.discountType==="percent" ? `${c.discountValue}%` : formatPrice(c.discountValue)} <span className="text-xs font-normal text-gray-500">{c.description}</span></td>
                  <td className="p-3 text-black dark:text-white">{formatPrice(c.minOrder)}</td>
                  <td className="p-3 text-xs text-black dark:text-white">{new Date(c.expiry).toLocaleDateString()}</td>
                  <td className="p-3 text-black dark:text-white">{c.usedCount || 0} / {c.usageLimit}</td>
                  <td className="p-3"><button onClick={()=> toggleCoupon(c.code, c.isActive)} className={`px-3 py-1 rounded-full text-xs font-medium ${c.isActive ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30" : "bg-red-50 text-red-700"}`}>{c.isActive ? "Active" : "Inactive"}</button></td>
                  <td className="p-3 flex gap-1">
                    <button onClick={()=> navigator.clipboard.writeText(c.code)} className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition text-xs">📋</button>
                    <button onClick={()=> handleDelete(c.code)} className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-red-500 hover:text-white transition text-xs">🗑️</button>
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
