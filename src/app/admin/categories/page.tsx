"use client";
import { useEffect, useState } from "react";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image: string;
  description?: string;
  count?: number;
  isActive: boolean;
};

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: "", image: "", description: "" });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchCategories = () => {
    fetch("/api/categories").then(r=>r.json()).then(d=> setCategories(d.categories||[]));
  };
  useEffect(()=> { fetchCategories(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if(data.secure_url || data.url) setForm({...form, image: data.secure_url || data.url});
      else alert("Upload failed: "+data.error);
    } catch(err:any){ alert(err.message); }
    setUploading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!form.name || !form.image) return alert("Name and image required - image will be uploaded to Cloudinary");
    setSaving(true);
    try {
      if(editing) {
        const res = await fetch("/api/categories", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ _id: editing._id, ...form })});
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);
      } else {
        const res = await fetch("/api/categories", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form)});
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);
      }
      setForm({ name: "", image: "", description: "" });
      setShowForm(false);
      setEditing(null);
      fetchCategories();
    } catch(err:any){ alert("❌ "+err.message); }
    setSaving(false);
  };

  const handleEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, image: c.image, description: c.description||"" });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this category? Products with this category will remain but category will be gone.")) return;
    await fetch(`/api/categories?id=${id}`, { method: "DELETE" });
    fetchCategories();
  };

  const toggleActive = async (c: Category) => {
    await fetch("/api/categories", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ _id: c._id, isActive: !c.isActive })});
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Create, edit and manage product categories • Images auto-upload to Cloudinary</p>
        </div>
        <button onClick={()=> { setShowForm(!showForm); setEditing(null); setForm({ name: "", image: "", description: "" });}} className="inline-flex items-center justify-center bg-black dark:bg-white text-white dark:text-black font-medium px-5 py-2.5 rounded-full text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
          {showForm ? "Cancel" : "New Category"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
          <h3 className="font-medium text-black dark:text-white">{editing ? "Edit Category" : "Add New Category"}</h3>
          <p className="text-xs text-gray-500 mt-1">Category image will be uploaded to Cloudinary CDN for fast delivery</p>
          
          <form onSubmit={handleSave} className="grid md:grid-cols-2 gap-4 mt-6">
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">Category Name *</span>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sneakers" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5 dark:focus:ring-white/10 focus:border-black dark:focus:border-white transition" />
              <span className="text-xs text-gray-400">Slug auto-generates: {form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</span>
            </label>
            
            <label className="space-y-1.5">
              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">Description</span>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Comfortable shoes for daily wear" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-black/5" />
            </label>

            <div className="md:col-span-2 space-y-1.5">
              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">Category Image * (Cloudinary)</span>
              <div className="border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-6 text-center bg-gray-50/50 dark:bg-zinc-900/50">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="cat-upload" />
                <label htmlFor="cat-upload" className="cursor-pointer inline-flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  </div>
                  <span className="text-sm font-medium mt-2 text-black dark:text-white">{uploading ? "Uploading to Cloudinary..." : "Click to upload image"}</span>
                  <span className="text-xs text-gray-500">600x400 recommended • Auto Cloudinary</span>
                </label>
                {form.image && (
                  <div className="mt-4 flex justify-center">
                    <div className="relative">
                      <img src={form.image} alt="Preview" className="w-48 h-32 object-cover rounded-xl border border-gray-200 dark:border-zinc-700" />
                      <button type="button" onClick={() => setForm({ ...form, image: "" })} className="absolute -top-2 -right-2 w-6 h-6 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center text-xs">×</button>
                    </div>
                  </div>
                )}
                {form.image && <p className="text-xs text-green-600 mt-2 font-medium">✓ Cloudinary uploaded</p>}
              </div>
            </div>

            <div className="md:col-span-2 flex gap-3 pt-2">
              <button disabled={saving || uploading} type="submit" className="flex-1 bg-black dark:bg-white text-white dark:text-black font-medium py-2.5 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50">
                {saving ? "Saving..." : editing ? "Update Category" : "Create Category"}
              </button>
              <button type="button" onClick={()=> { setShowForm(false); setEditing(null);}} className="px-6 border border-gray-200 dark:border-zinc-700 rounded-full font-medium hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-medium text-black dark:text-white">All Categories <span className="ml-2 text-xs font-normal text-gray-500">({categories.length})</span></h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-400">{categories.filter(c=>c.isActive).length} active</span>
        </div>
        
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-gray-400">📁</div>
            <h3 className="font-medium mt-3 text-black dark:text-white">No categories</h3>
            <p className="text-sm text-gray-500 mt-1">Create your first category to organize products</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {categories.map((cat) => (
              <div key={cat._id} className="group border border-gray-100 dark:border-zinc-800 rounded-xl overflow-hidden hover:border-gray-200 dark:hover:border-zinc-700 transition bg-white dark:bg-zinc-900">
                <div className="relative h-36 bg-gray-50 dark:bg-zinc-800 overflow-hidden">
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition" />
                  <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-medium ${cat.isActive ? "bg-green-500 text-white" : "bg-gray-500 text-white"}`}>{cat.isActive ? "Active" : "Inactive"}</span>
                  <span className="absolute bottom-3 left-3 bg-black/70 backdrop-blur text-white text-xs px-2.5 py-1 rounded-full">/{cat.slug}</span>
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-black dark:text-white line-clamp-1">{cat.name}</h4>
                  <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1 mt-1 min-h-[16px]">{cat.description || "No description"}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50 dark:border-zinc-800">
                    <span className="text-xs text-gray-400">{cat.count || 0} products</span>
                    <div className="flex gap-1">
                      <button onClick={()=> toggleActive(cat)} className={`w-7 h-7 rounded-full border flex items-center justify-center transition text-xs ${cat.isActive ? "border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100" : "border-green-200 bg-green-50 text-green-600"}`} title={cat.isActive ? "Deactivate" : "Activate"}>
                        {cat.isActive ? "⏸" : "▶"}
                      </button>
                      <button onClick={()=> handleEdit(cat)} className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition text-xs">✏️</button>
                      <button onClick={()=> handleDelete(cat._id)} className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition text-xs">🗑️</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4">
        <h4 className="font-medium text-sm text-blue-900 dark:text-blue-100">💡 How categories work</h4>
        <ul className="text-xs text-blue-700 dark:text-blue-300 mt-2 space-y-1 list-disc ml-4">
          <li>Categories appear on Shop page filters and Home page</li>
          <li>Images are uploaded to Cloudinary CDN automatically</li>
          <li>Slug is auto-generated from name for SEO-friendly URLs (/shop?category=sneakers)</li>
          <li>Inactive categories are hidden from customers but kept for products</li>
        </ul>
      </div>
    </div>
  );
}
