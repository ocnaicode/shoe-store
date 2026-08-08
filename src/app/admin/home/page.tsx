"use client";
import { useEffect, useState } from "react";

type Slide = {
  badge: string;
  title: string;
  highlight: string;
  subtitle: string;
  desc: string;
  image: string;
  bg: string;
  accent: string;
  productName: string;
  productPrice: string;
  productImage: string;
  cta: string;
  isActive: boolean;
};

export default function AdminHomePage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [sections, setSections] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);
  const [form, setForm] = useState<Slide>({
    badge: "", title: "", highlight: "", subtitle: "", desc: "", image: "", bg: "from-amber-100 to-orange-50", accent: "from-amber-500 to-orange-600", productName: "", productPrice: "", productImage: "", cta: "/shop", isActive: true
  });
  const [uploading, setUploading] = useState<{field: string} | null>(null);

  const fetchHome = () => {
    fetch("/api/home-settings").then(r=>r.json()).then(d=>{
      setSlides(d.heroSlides || []);
      setSections(d.sections || {});
      setLoading(false);
    });
  };
  useEffect(()=>{ fetchHome(); }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: keyof Slide) => {
    const file = e.target.files?.[0]; if(!file) return;
    setUploading({field});
    const fd=new FormData(); fd.append("file", file);
    const res=await fetch("/api/upload",{method:"POST",body:fd});
    const data=await res.json();
    if(data.secure_url||data.url) setForm({...form, [field]: data.secure_url||data.url});
    setUploading(null);
  };

  const handleSaveSlide = () => {
    if(!form.title || !form.image) return alert("Title and image required");
    if(editingIdx!==null){
      const updated=[...slides]; updated[editingIdx]=form; setSlides(updated);
      setEditingIdx(null);
    } else {
      setSlides([...slides, form]);
    }
    setForm({ badge:"", title:"", highlight:"", subtitle:"", desc:"", image:"", bg:"from-amber-100 to-orange-50", accent:"from-amber-500 to-orange-600", productName:"", productPrice:"", productImage:"", cta:"/shop", isActive:true });
  };

  const handleEdit = (idx:number)=>{
    setForm(slides[idx]); setEditingIdx(idx);
  };
  const handleDelete = (idx:number)=>{
    if(!confirm("Delete this slide?")) return;
    setSlides(slides.filter((_,i)=>i!==idx));
  };
  const handleToggleActive = (idx:number)=>{
    const u=[...slides]; u[idx].isActive=!u[idx].isActive; setSlides(u);
  };

  const handleSaveAll = async()=>{
    setSaving(true);
    const res=await fetch("/api/home-settings",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({heroSlides:slides, sections})});
    const data=await res.json();
    if(data.error) alert(data.error); else alert("✅ Home page updated! Refresh home to see changes.");
    setSaving(false);
  };

  const updateSection = (key:string, field:string, value:any)=>{
    setSections((prev:any)=> ({...prev, [key]: {...prev[key], [field]: value}}));
  };

  if(loading) return <div className="text-center py-12">Loading home settings...</div>;

  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Home Page Customize 🏠</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Hero slider and all sections fully customizable - Add/edit/delete slides, toggle sections, edit titles</p>
      </div>

      {/* Hero Slides */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <h3 className="font-medium text-black dark:text-white">🎬 Hero Slider (Top)</h3>
        <p className="text-xs text-gray-500 mt-1">Full customizable slides - image, text, colors, CTA. All images Cloudinary.</p>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {slides.map((s, idx)=> (
            <div key={idx} className={`border rounded-xl overflow-hidden ${s.isActive ? "border-gray-200 dark:border-zinc-700" : "border-dashed opacity-60"}`}>
              <img src={s.image} alt={s.title} className="w-full h-32 object-cover" />
              <div className="p-3">
                <div className="font-medium text-sm truncate text-black dark:text-white">{s.title} <span className="text-amber-600">{s.highlight}</span> {s.subtitle}</div>
                <div className="text-xs text-gray-500 truncate">{s.desc}</div>
                <div className="flex gap-1 mt-2">
                  <button onClick={()=>handleEdit(idx)} className="flex-1 border border-gray-200 dark:border-zinc-700 rounded-full py-1.5 text-xs font-medium">Edit</button>
                  <button onClick={()=>handleToggleActive(idx)} className={`flex-1 rounded-full py-1.5 text-xs font-medium ${s.isActive?"bg-green-50 text-green-700 border border-green-200":"bg-gray-100 text-gray-500"}`}>{s.isActive?"Active":"Inactive"}</button>
                  <button onClick={()=>handleDelete(idx)} className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center">×</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-5 bg-gray-50/50 dark:bg-zinc-800/30">
          <h4 className="font-medium text-sm text-black dark:text-white">{editingIdx!==null?"Edit Slide":"Add New Slide"}</h4>
          <div className="grid md:grid-cols-2 gap-3 mt-4">
            <label className="space-y-1"><span className="text-xs font-medium">Badge</span><input value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})} placeholder="NEW COLLECTION 2026" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium">CTA Link</span><input value={form.cta} onChange={e=>setForm({...form,cta:e.target.value})} placeholder="/shop" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium">Title</span><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="STEP INTO" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium">Highlight (gradient)</span><input value={form.highlight} onChange={e=>setForm({...form,highlight:e.target.value})} placeholder="COMFORT" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium">Subtitle</span><input value={form.subtitle} onChange={e=>setForm({...form,subtitle:e.target.value})} placeholder="& STYLE" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium">Desc</span><input value={form.desc} onChange={e=>setForm({...form,desc:e.target.value})} placeholder="Description" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1">
              <span className="text-xs font-medium">Main Image (Cloudinary) *</span>
              <div className="flex gap-2">
                <input value={form.image} onChange={e=>setForm({...form,image:e.target.value})} placeholder="https://..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <label className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg text-xs font-medium cursor-pointer">
                  {uploading?.field==="image"?"...":"Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={e=>handleImageUpload(e,"image")} />
                </label>
              </div>
            </label>
            <label className="space-y-1"><span className="text-xs font-medium">Bg Gradient</span><input value={form.bg} onChange={e=>setForm({...form,bg:e.target.value})} placeholder="from-amber-100 to-orange-50" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium">Accent Gradient</span><input value={form.accent} onChange={e=>setForm({...form,accent:e.target.value})} placeholder="from-amber-500 to-orange-600" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium">Product Name</span><input value={form.productName} onChange={e=>setForm({...form,productName:e.target.value})} placeholder="HOKO Air Max" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1"><span className="text-xs font-medium">Product Price</span><input value={form.productPrice} onChange={e=>setForm({...form,productPrice:e.target.value})} placeholder="৳4,590" className="w-full border rounded-lg px-3 py-2 text-sm" /></label>
            <label className="space-y-1 md:col-span-2">
              <span className="text-xs font-medium">Product Image (Cloudinary)</span>
              <div className="flex gap-2">
                <input value={form.productImage} onChange={e=>setForm({...form,productImage:e.target.value})} placeholder="https://..." className="flex-1 border rounded-lg px-3 py-2 text-sm" />
                <label className="bg-black dark:bg-white text-white dark:text-black px-3 py-2 rounded-lg text-xs font-medium cursor-pointer">
                  {uploading?.field==="productImage"?"...":"Upload"}
                  <input type="file" accept="image/*" className="hidden" onChange={e=>handleImageUpload(e,"productImage")} />
                </label>
              </div>
            </label>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSaveSlide} className="flex-1 bg-black dark:bg-white text-white dark:text-black font-medium py-2.5 rounded-full">{editingIdx!==null?"Update Slide":"Add Slide"}</button>
            {editingIdx!==null && <button onClick={()=>{setEditingIdx(null); setForm({ badge:"", title:"", highlight:"", subtitle:"", desc:"", image:"", bg:"from-amber-100 to-orange-50", accent:"from-amber-500 to-orange-600", productName:"", productPrice:"", productImage:"", cta:"/shop", isActive:true });}} className="px-6 border rounded-full font-medium">Cancel</button>}
          </div>
        </div>
      </div>

      {/* Sections */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-6">
        <h3 className="font-medium text-black dark:text-white">📑 Sections Customize</h3>
        <p className="text-xs text-gray-500 mt-1">Toggle visibility and edit titles for each home section</p>
        <div className="space-y-4 mt-4">
          {Object.entries(sections).map(([key, sec]: any)=> (
            <div key={key} className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 border border-gray-100 dark:border-zinc-800 rounded-xl">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={sec.enabled} onChange={e=>updateSection(key,"enabled",e.target.checked)} className="w-4 h-4 accent-black" />
                  <span className="font-medium text-sm capitalize text-black dark:text-white">{key.replace(/([A-Z])/g, " $1")}</span>
                </label>
                {!sec.enabled && <span className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-full text-gray-500">Hidden</span>}
              </div>
              <div className="flex gap-2 flex-1 md:justify-end">
                <input value={sec.title||""} onChange={e=>updateSection(key,"title",e.target.value)} placeholder="Title" className="flex-1 md:max-w-[200px] border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm" />
                {sec.subtitle!==undefined && <input value={sec.subtitle||""} onChange={e=>updateSection(key,"subtitle",e.target.value)} placeholder="Subtitle" className="flex-1 md:max-w-[200px] border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-1.5 text-sm" />}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button onClick={handleSaveAll} disabled={saving} className="w-full bg-black dark:bg-white text-white dark:text-black font-medium py-3 rounded-full hover:bg-zinc-800 disabled:opacity-50">
        {saving?"Saving...":"💾 Save All Home Settings"}
      </button>

      <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-4 text-sm">
        <strong>💡 Home page fully customizable:</strong> Hero slider (add/edit/delete, Cloudinary images, gradient colors), and every section (Categories, Featured, Promo, Best Sellers, New Arrivals, Brands, Why Choose Us, Instagram, Testimonials) can be toggled and titled. Changes reflect instantly on home page.
      </div>
    </div>
  );
}
