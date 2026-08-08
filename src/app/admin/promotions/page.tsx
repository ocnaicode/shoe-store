"use client";
import { useEffect, useState } from "react";

type Promotion = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  displayDelay: number;
  createdAt: string;
};

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [form, setForm] = useState({ title: "", subtitle: "", image: "", link: "/shop", buttonText: "Shop Now", isActive: true, displayDelay: 3 });
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchPromotions = () => {
    fetch("/api/promotions").then(r=>r.json()).then(d=> setPromotions(d.promotions||[]));
  };
  useEffect(()=> { fetchPromotions(); }, []);

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
    if(!form.title || !form.image) return alert("Title and image required");
    setSaving(true);
    try {
      if(editing) {
        const res = await fetch("/api/promotions", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ _id: editing._id, ...form })});
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);
        setEditing(null);
      } else {
        const res = await fetch("/api/promotions", { method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(form)});
        const data = await res.json();
        if(!res.ok) throw new Error(data.error);
      }
      setForm({ title: "", subtitle: "", image: "", link: "/shop", buttonText: "Shop Now", isActive: true, displayDelay: 3 });
      setShowForm(false);
      fetchPromotions();
      alert("✅ Promotion saved! Website e popup hisabe show hobe.");
    } catch(err:any){ alert("❌ "+err.message); }
    setSaving(false);
  };

  const handleEdit = (p: Promotion) => {
    setEditing(p);
    setForm({ title: p.title, subtitle: p.subtitle||"", image: p.image, link: p.link||"/shop", buttonText: p.buttonText||"Shop Now", isActive: p.isActive, displayDelay: p.displayDelay });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this promotion popup?")) return;
    await fetch(`/api/promotions?id=${id}`, { method: "DELETE" });
    fetchPromotions();
  };

  const toggleActive = async (p: Promotion) => {
    await fetch("/api/promotions", { method: "PATCH", headers: {"Content-Type":"application/json"}, body: JSON.stringify({ _id: p._id, isActive: !p.isActive })});
    fetchPromotions();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Promotion Popups 🎉</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Website e popup image create korun - Edit, Delete, Update sob ekhan theke.</p>
        </div>
        <button onClick={()=> { setShowForm(!showForm); setEditing(null); setForm({ title: "", subtitle: "", image: "", link: "/shop", buttonText: "Shop Now", isActive: true, displayDelay: 3 });}} className="bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-zinc-800">
          {showForm ? "Cancel" : "+ Create Popup"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
          <h3 className="font-black text-lg">{editing ? "Edit Promotion" : "Create New Promotion Popup"}</h3>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <label>
              <span className="text-xs font-bold">Title *</span>
              <input required value={form.title} onChange={e=> setForm({...form, title:e.target.value})} placeholder="Eid Dhamaka Offer - 50% OFF!" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label>
              <span className="text-xs font-bold">Subtitle</span>
              <input value={form.subtitle} onChange={e=> setForm({...form, subtitle:e.target.value})} placeholder="Limited time only" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label>
              <span className="text-xs font-bold">Link (kothay jabe click korle)</span>
              <input value={form.link} onChange={e=> setForm({...form, link:e.target.value})} placeholder="/shop?category=sneakers" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label>
              <span className="text-xs font-bold">Button Text</span>
              <input value={form.buttonText} onChange={e=> setForm({...form, buttonText:e.target.value})} placeholder="Shop Now" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label>
              <span className="text-xs font-bold">Display Delay (seconds)</span>
              <input type="number" value={form.displayDelay} onChange={e=> setForm({...form, displayDelay: Number(e.target.value)})} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label className="flex items-center gap-2 mt-6">
              <input type="checkbox" checked={form.isActive} onChange={e=> setForm({...form, isActive:e.target.checked})} className="accent-black w-5 h-5" />
              <span className="font-bold text-sm">Active (website e show hobe)</span>
            </label>
            <div className="md:col-span-2">
              <span className="text-xs font-bold">Popup Image *</span>
              <div className="mt-2 border-2 border-dashed rounded-2xl p-6 text-center bg-gray-50 dark:bg-zinc-800">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" id="promo-upload" />
                <label htmlFor="promo-upload" className="cursor-pointer">
                  <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mx-auto">↑</div>
                  <div className="font-bold text-sm mt-2">{uploading ? "Uploading to Media..." : "Click to Upload"}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">Recommended: 600x600px • PNG/JPG</div>
                </label>
                {form.image && (
                  <div className="mt-4">
                    <img src={form.image} alt="Preview" className="w-full max-w-sm h-48 object-cover rounded-xl mx-auto border" />
                    <div className="text-xs text-green-600 font-bold mt-2">✅ Uploaded to Media</div>
                    <div className="text-xs break-all bg-white dark:bg-zinc-900 p-2 rounded border mt-1">{form.image.slice(0,80)}...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button disabled={saving || uploading} type="submit" className="flex-1 bg-black text-white font-black py-3 rounded-full hover:bg-zinc-800 disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update Promotion" : "Create Promotion"}
            </button>
            <button type="button" onClick={()=> { setShowForm(false); setEditing(null);}} className="px-8 border rounded-full font-bold hover:bg-gray-50 dark:bg-zinc-800">Cancel</button>
          </div>
        </form>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.length===0 ? (
          <div className="md:col-span-3 bg-white dark:bg-zinc-900 rounded-2xl p-12 text-center border">
            <div className="text-4xl">🎉</div>
            <h3 className="font-bold mt-3">No promotions yet</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Create korle website er home page e popup hisabe show hobe (3 sec por).</p>
          </div>
        ) : promotions.map(p=> (
          <div key={p._id} className="bg-white dark:bg-zinc-900 rounded-2xl border overflow-hidden">
            <div className="relative">
              <img src={p.image} alt={p.title} className="w-full h-48 object-cover" />
              <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${p.isActive ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}>{p.isActive ? "Active" : "Inactive"}</span>
              <span className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs">{p.displayDelay}s delay</span>
            </div>
            <div className="p-4">
              <h3 className="font-black line-clamp-1">{p.title}</h3>
              <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-1">{p.subtitle}</p>
              <div className="text-xs text-gray-400 mt-1">Link: {p.link}</div>
              <div className="flex gap-2 mt-4">
                <button onClick={()=> toggleActive(p)} className={`flex-1 py-2 rounded-full text-xs font-bold ${p.isActive ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}`}>{p.isActive ? "Deactivate" : "Activate"}</button>
                <button onClick={()=> handleEdit(p)} className="flex-1 bg-black text-white py-2 rounded-full text-xs font-bold hover:bg-zinc-800">Edit</button>
                <button onClick={()=> handleDelete(p._id)} className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-red-500 hover:text-white">🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm">
        <strong>💡 Kivabe kaj kore?</strong> Active promotion thakle home page load er {promotions[0]?.displayDelay || 3} sec por popup show hobe. User close korle session e ar show hobe na. Sob image CDN e save hoy, tai fast load hobe.
      </div>
    </div>
  );
}