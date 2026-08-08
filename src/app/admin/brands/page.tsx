"use client";
import { useEffect, useState } from "react";

type Brand = {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean;
};

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: "", logo: "", description: "" });
  const [saving, setSaving] = useState(false);

  const fetchBrands = () => {
    fetch("/api/brands").then(r=>r.json()).then(d=> setBrands(d.brands||[]));
  };
  useEffect(()=> { fetchBrands(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.name) return alert("Name required");
    setSaving(true);
    try {
      if(editing) {
        const res = await fetch("/api/brands", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ _id: editing._id, ...form })});
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch("/api/brands", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form)});
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);
      }
      setForm({ name: "", logo: "", description: "" });
      setShowForm(false);
      setEditing(null);
      fetchBrands();
    } catch(err:any){ alert("❌ "+err.message); }
    setSaving(false);
  };

  const handleEdit = (b: Brand) => {
    setEditing(b);
    setForm({ name: b.name, logo: b.logo||"", description: b.description||"" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this brand?")) return;
    await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
    fetchBrands();
  };

  const toggleActive = async (b: Brand) => {
    await fetch("/api/brands", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ _id: b._id, isActive: !b.isActive })});
    fetchBrands();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Brands</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Create, edit and manage product brands • Used in product form</p>
        </div>
        <button onClick={()=> { setShowForm(!showForm); setEditing(null); setForm({ name: "", logo: "", description: "" });}} className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black font-medium px-5 py-2.5 rounded-full text-sm">
          {showForm ? "Cancel" : "New Brand"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="font-medium text-black dark:text-white">{editing ? "Edit Brand" : "Add New Brand"}</h3>
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4 mt-4">
            <label className="space-y-1.5">
              <span className="text-xs font-medium">Brand Name *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Nike" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:border-black" />
              <span className="text-xs text-gray-400">Slug: {form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</span>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-medium">Logo URL (optional)</span>
              <input value={form.logo} onChange={(e) => setForm({ ...form, logo: e.target.value })} placeholder="https://..." className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm" />
            </label>
            <label className="md:col-span-2 space-y-1.5">
              <span className="text-xs font-medium">Description</span>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brand description for SEO" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm" />
            </label>
            <div className="md:col-span-2 flex gap-3 pt-2">
              <button disabled={saving} type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black font-medium py-2.5 rounded-full disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update Brand" : "Create Brand"}
              </button>
              <button type="button" onClick={()=> { setShowForm(false); setEditing(null);}} className="px-6 border border-gray-200 dark:border-zinc-700 rounded-full font-medium text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-medium text-black dark:text-white">All Brands <span className="text-sm font-normal text-gray-500">({brands.length})</span></h3>
          <span className="text-xs bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700">{brands.filter(b=>b.isActive).length} active</span>
        </div>
        
        {brands.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400">🏷️</div>
            <h3 className="font-medium mt-3 text-black dark:text-white">No brands</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first brand to use in products</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-zinc-800">
            {brands.map((brand) => (
              <div key={brand._id} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-black dark:text-white border border-gray-200 dark:border-zinc-700">
                    {brand.name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-sm text-black dark:text-white">{brand.name}</div>
                    <div className="text-xs text-gray-500">/{brand.slug} • {brand.description || "No description"}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={()=> toggleActive(brand)} className={`px-3 py-1 rounded-full text-xs font-medium border ${brand.isActive ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/30" : "bg-gray-100 text-gray-500"}`}>{brand.isActive ? "Active" : "Inactive"}</button>
                  <button onClick={()=> handleEdit(brand)} className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition text-xs">✎</button>
                  <button onClick={()=> handleDelete(brand._id)} className="w-8 h-8 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition text-xs">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-sm">
        <h4 className="font-medium text-blue-900 dark:text-blue-100">💡 Brands in products</h4>
        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Brands created here appear in Admin → Products → Brand dropdown. Inactive brands are hidden from customers but kept for existing products.</p>
      </div>
    </div>
  );
}
