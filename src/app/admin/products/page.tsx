"use client";
import { useState, useEffect } from "react";
import { products as initialProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

type Product = any;
type Variant = { size: number; stock: number; price?: number; sku?: string };
type Color = { name: string; hex: string };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    price: "",
    comparePrice: "",
    category: "sneakers",
    brand: "HOKO",
    description: "",
    sku: "",
    material: "",
    stock: "",
    images: [] as string[],
    isVariable: true,
  });
  const [variants, setVariants] = useState<Variant[]>([
    { size: 38, stock: 10 }, { size: 39, stock: 15 }, { size: 40, stock: 20 }, { size: 41, stock: 15 }, { size: 42, stock: 10 },
  ]);
  const [colors, setColors] = useState<Color[]>([{ name: "Black", hex: "#111111" }]);
  const [descriptionImages, setDescriptionImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadingDesc, setUploadingDesc] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/products").then(r=>r.json()).then(d=> { if(d.products?.length) setProducts(d.products); });
    fetch("/api/categories").then(r=>r.json()).then(d=> { if(d.categories?.length) setCategories(d.categories); });
    fetch("/api/brands").then(r=>r.json()).then(d=> { if(d.brands?.length) setBrands(d.brands); });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if(!files) return;
    setUploading(true);
    for(let i=0;i<files.length;i++){
      const fd=new FormData(); fd.append("file", files[i]);
      try{
        const res=await fetch("/api/upload",{method:"POST",body:fd});
        const data=await res.json();
        if(data.secure_url||data.url) setForm(prev=>({...prev, images:[...prev.images, data.secure_url||data.url]}));
      }catch{}
    }
    setUploading(false); e.target.value="";
  };
  const handleDescImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if(!files) return;
    setUploadingDesc(true);
    for(let i=0;i<files.length;i++){
      const fd=new FormData(); fd.append("file", files[i]);
      try{
        const res=await fetch("/api/upload",{method:"POST",body:fd});
        const data=await res.json();
        if(data.secure_url||data.url) setDescriptionImages(prev=>[...prev, data.secure_url||data.url]);
      }catch{}
    }
    setUploadingDesc(false); e.target.value="";
  };

  const handleVariantChange = (idx:number, field:keyof Variant, value:any)=>{
    const u=[...variants]; (u[idx] as any)[field]= field==="size"||field==="stock"?Number(value):value; setVariants(u);
  };
  const addVariant=()=> setVariants([...variants,{size:43,stock:10}]);
  const removeVariant=(idx:number)=> setVariants(variants.filter((_,i)=>i!==idx));

  const addColor=()=> setColors([...colors,{name:"",hex:"#000000"}]);
  const updateColor=(idx:number, field:keyof Color, value:string)=>{
    const u=[...colors]; (u[idx] as any)[field]=value; setColors(u);
  };
  const removeColor=(idx:number)=> setColors(colors.filter((_,i)=>i!==idx));

  const handleSave = async ()=>{
    if(!form.name||!form.price) return alert("Name and price required");
    if(form.images.length===0) return alert("At least one image required");
    if(colors.length===0) return alert("At least one color");
    setSaving(true);
    const totalStock = form.isVariable ? variants.reduce((a,b)=>a+Number(b.stock||0),0) : Number(form.stock)||0;
    const payload:any={
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g,"-") + (editing?"":"-"+Date.now().toString().slice(-4)),
      description: form.description || "Premium shoe",
      price: Number(form.price),
      comparePrice: form.comparePrice?Number(form.comparePrice):undefined,
      category: form.category,
      brand: form.brand,
      stock: totalStock,
      sizes: variants.map(v=>v.size),
      variants: form.isVariable? variants.map(v=>({size:v.size, stock:Number(v.stock), price: v.price?Number(v.price):Number(form.price), sku: v.sku||`${form.name.slice(0,3).toUpperCase()}-${v.size}`})):undefined,
      colors: colors.filter(c=>c.name && c.hex),
      images: form.images,
      descriptionImages,
      sku: form.sku || `HOKO-${Date.now().toString().slice(-6)}`,
      material: form.material||"Synthetic",
      rating:4.5, reviews:0,
    };
    try{
      if(editing){
        await fetch(`/api/products`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
        setProducts(prev=> prev.filter(p=>p._id!==editing._id));
        setProducts(prev=> [payload,...prev]);
        alert("Product updated!");
      } else {
        const res=await fetch("/api/products",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
        const data=await res.json();
        if(data.product) setProducts(prev=>[data.product,...prev]);
        else setProducts(prev=>[{...payload,_id:Date.now().toString(),createdAt:new Date().toISOString()},...prev]);
        alert("✅ Product added successfully!");
      }
      setShowAdd(false); setEditing(null);
      setForm({ name:"",price:"",comparePrice:"",category: categories[0]?.slug||"sneakers",brand:"HOKO",description:"",sku:"",material:"",stock:"",images:[],isVariable:true});
      setVariants([{size:38,stock:10},{size:39,stock:15},{size:40,stock:20},{size:41,stock:15},{size:42,stock:10}]);
      setColors([{name:"Black",hex:"#111111"}]);
      setDescriptionImages([]);
    }catch(e:any){ alert(e.message); }
    setSaving(false);
  };

  const handleEdit=(p:Product)=>{
    setEditing(p);
    setForm({ name:p.name, price:String(p.price), comparePrice: p.comparePrice?String(p.comparePrice):"", category:p.category, brand:p.brand, description:p.description, sku:p.sku||"", material:p.material||"", stock:String(p.stock), images:p.images||[], isVariable:!!p.variants });
    if(p.variants?.length) setVariants(p.variants);
    else if(p.sizes) setVariants(p.sizes.map((s:number)=>({size:s,stock:10})));
    if(p.colors?.length) setColors(p.colors);
    if(p.descriptionImages?.length) setDescriptionImages(p.descriptionImages);
    setShowAdd(true);
  };
  const handleDelete=async(id:string)=>{
    if(!confirm("Delete?")) return;
    try{ await fetch(`/api/products?id=${id}`,{method:"DELETE"});}catch{}
    setProducts(prev=>prev.filter(p=>p._id!==id && p.id!==id));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Products</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Variable sizes • Multiple colors • SEO ready</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={()=>{setShowAdd(!showAdd); if(!showAdd){setEditing(null); setForm({ name:"",price:"",comparePrice:"",category: categories[0]?.slug||"sneakers",brand:"HOKO",description:"",sku:"",material:"",stock:"",images:[],isVariable:true}); setDescriptionImages([]);}}} className="bg-black dark:bg-white text-white dark:text-black text-sm font-medium px-5 py-2 rounded-full">{showAdd?"Cancel":"Add Product"}</button>
          </div>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800">
            <h3 className="font-medium text-black dark:text-white">{editing?"Edit Product":"New Product"}</h3>
            <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Fill details • Colors & variants for shoes</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Basic */}
            <div className="grid md:grid-cols-2 gap-4">
              <label className="space-y-1.5">
                <span className="text-xs font-medium">Product Name *</span>
                <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="HOKO Air Runner Pro" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900 focus:outline-none focus:border-black dark:focus:border-white" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium flex items-center gap-2">Brand <Link href="/admin/brands" className="text-blue-600 text-xs font-normal hover:underline">Manage →</Link></span>
                <select value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})} className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900">
                  {brands.length ? brands.filter(b=>b.isActive).map((b:any)=> <option key={b._id} value={b.name}>{b.name}</option>) : ["HOKO","Nike","Adidas","Puma","Bata","Apex","Lotto","Woodland"].map(b=> <option key={b} value={b}>{b}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium">Price (৳) *</span>
                <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="4590" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium">Compare Price (৳)</span>
                <input type="number" value={form.comparePrice} onChange={e=>setForm({...form,comparePrice:e.target.value})} placeholder="5990 (for % badge)" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium flex items-center gap-2">Category * <Link href="/admin/categories" className="text-blue-600 text-xs font-normal hover:underline">Manage →</Link></span>
                <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm bg-white dark:bg-zinc-900">
                  {categories.length ? categories.filter(c=>c.isActive).map((c:any)=> <option key={c._id} value={c.slug}>{c.name}</option>) : ["sneakers","formal","boots","sports","casual","loafers"].map(c=> <option key={c} value={c}>{c}</option>)}
                </select>
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium">SKU</span>
                <input value={form.sku} onChange={e=>setForm({...form,sku:e.target.value})} placeholder="Auto: HOKO-123456" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm" />
              </label>
              <label className="space-y-1.5">
                <span className="text-xs font-medium">Material</span>
                <input value={form.material} onChange={e=>setForm({...form,material:e.target.value})} placeholder="Genuine Leather / Mesh" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm" />
              </label>
              <label className="flex items-center gap-2 pt-6">
                <input type="checkbox" checked={form.isVariable} onChange={e=>setForm({...form,isVariable:e.target.checked})} className="w-4 h-4 rounded accent-black" />
                <span className="text-sm font-medium">Variable product</span>
              </label>
              <label className="md:col-span-2 space-y-1.5">
                <span className="text-xs font-medium">Description (SEO)</span>
                <textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} rows={3} placeholder="Premium shoe description for Google..." className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm" />
              </label>
              <div className="md:col-span-2 space-y-1.5">
                <span className="text-xs font-medium">Description Images - shown in product details</span>
                <div className="border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-4 text-center bg-gray-50/30 dark:bg-zinc-900/30">
                  <input type="file" multiple accept="image/*" onChange={handleDescImageUpload} className="hidden" id="desc-upload" />
                  <label htmlFor="desc-upload" className="cursor-pointer inline-flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center text-sm">＋</div>
                    <span className="text-xs font-medium mt-1 text-black dark:text-white">{uploadingDesc?"Uploading...":"Upload description images"}</span>
                    <span className="text-xs text-gray-500">These show inside Description tab below text</span>
                  </label>
                  {descriptionImages.length>0 && (
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      {descriptionImages.map((img,i)=>(
                        <div key={i} className="relative">
                          <img src={img} alt="" className="w-full h-20 object-cover rounded-lg border" />
                          <button type="button" onClick={()=>setDescriptionImages(prev=>prev.filter((_,idx)=>idx!==i))} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs">×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Colors - NEW */}
            <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50/50 dark:bg-zinc-900/50">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">🎨 Colors</h4>
                <button type="button" onClick={addColor} className="text-xs font-medium border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black dark:text-white transition">+ Add Color</button>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Add product colors with name & hex. Customer will see color dots.</p>
              <div className="mt-3 space-y-2">
                {colors.map((c, idx)=> (
                  <div key={idx} className="flex gap-2 items-center bg-white dark:bg-zinc-900 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800">
                    <input type="color" value={c.hex} onChange={e=>updateColor(idx,"hex",e.target.value)} className="w-10 h-10 rounded-lg border-0 p-0.5 cursor-pointer" />
                    <input value={c.name} onChange={e=>updateColor(idx,"name",e.target.value)} placeholder="Color name (e.g. Black)" className="flex-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm" />
                    <input value={c.hex} onChange={e=>updateColor(idx,"hex",e.target.value)} placeholder="#111111" className="w-28 border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-sm font-mono" />
                    <div className="w-8 h-8 rounded-full border-2 border-white shadow ring-1 ring-gray-200 flex-shrink-0" style={{background:c.hex}} title={c.name}></div>
                    <button type="button" onClick={()=>removeColor(idx)} disabled={colors.length===1} className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 disabled:opacity-30">×</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Variants */}
            {form.isVariable ? (
              <div className="border border-gray-100 dark:border-zinc-800 rounded-xl p-4 bg-gray-50/50 dark:bg-zinc-900/50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">📏 Sizes & Stock</h4>
                  <button type="button" onClick={addVariant} className="text-xs font-medium border bg-white dark:bg-zinc-800 px-3 py-1.5 rounded-full">+ Add Size</button>
                </div>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Each size can have different stock & price. Total: {variants.reduce((a,b)=>a+Number(b.stock||0),0)} units</p>
                <div className="mt-3 space-y-2">
                  {variants.map((v, idx)=> (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-end bg-white dark:bg-zinc-900 p-3 rounded-lg border border-gray-100 dark:border-zinc-800">
                      <div className="col-span-3">
                        <label className="text-xs text-gray-500 dark:text-zinc-400">Size</label>
                        <input type="number" value={v.size} onChange={e=>handleVariantChange(idx,"size",e.target.value)} className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-sm" />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-gray-500 dark:text-zinc-400">Stock</label>
                        <input type="number" value={v.stock} onChange={e=>handleVariantChange(idx,"stock",e.target.value)} className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-sm" />
                      </div>
                      <div className="col-span-3">
                        <label className="text-xs text-gray-500 dark:text-zinc-400">Price (৳)</label>
                        <input type="number" value={v.price||""} onChange={e=>handleVariantChange(idx,"price",e.target.value)} placeholder={form.price||"Base"} className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 dark:text-zinc-400">SKU</label>
                        <input value={v.sku||""} onChange={e=>handleVariantChange(idx,"sku",e.target.value)} placeholder="Auto" className="w-full mt-1 border border-gray-200 dark:border-zinc-700 rounded-lg px-2 py-2 text-sm" />
                      </div>
                      <div className="col-span-1">
                        <button type="button" onClick={()=>removeVariant(idx)} className="w-full h-[36px] bg-red-50 text-red-600 rounded-lg hover:bg-red-100">×</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <label className="space-y-1.5">
                <span className="text-xs font-medium">Total Stock</span>
                <input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="50" className="w-full border border-gray-200 dark:border-zinc-700 rounded-lg px-3 py-2.5 text-sm" />
              </label>
            )}

            {/* Images */}
            <div className="space-y-1.5">
              <span className="text-xs font-medium">Images * (Multiple)</span>
              <div className="border border-dashed border-gray-200 dark:border-zinc-700 rounded-xl p-6 text-center bg-gray-50/30 dark:bg-zinc-900/30">
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
                <label htmlFor="file-upload" className="cursor-pointer inline-flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">↑</div>
                  <span className="text-sm font-medium mt-2 text-black dark:text-white">{uploading?"Uploading...":"Click to uploads"}</span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">PNG, JPG • Multiple</span>
                </label>
                {form.images.length>0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-left">
                    {form.images.map((img,i)=>(
                      <div key={i} className="relative group">
                        <img src={img} alt="" className="w-full h-28 object-cover rounded-lg border border-gray-200 dark:border-zinc-700" />
                        <span className="absolute top-1.5 left-1.5 bg-black text-white text-xs px-1.5 py-0.5 rounded-full">#{i+1}</span>
                        <button type="button" onClick={()=>setForm({...form,images:form.images.filter((_,idx)=>idx!==i)})} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">×</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-400">{form.images.length} image(s) • First is thumbnail • All uploaded to Media</p>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex gap-3">
            <button onClick={handleSave} disabled={saving||uploading} className="flex-1 bg-black dark:bg-white text-white dark:text-black font-medium py-2.5 rounded-full hover:bg-zinc-800 disabled:opacity-50">{saving?"Saving...": editing?"Update Product":"Create Product"}</button>
            <button onClick={()=>{setShowAdd(false);setEditing(null);}} className="px-6 border border-gray-200 dark:border-zinc-700 rounded-full font-medium hover:bg-white dark:bg-zinc-900 dark:hover:bg-zinc-800 text-sm">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between">
          <h3 className="font-medium text-black dark:text-white">Products <span className="text-sm font-normal text-gray-500">({products.length})</span></h3>
          <span className="text-xs bg-gray-50 dark:bg-zinc-800 px-2.5 py-1 rounded-full border">Atlas • {products.length} items</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800/50 text-xs text-gray-500 dark:text-zinc-400">
              <tr>
                <th className="text-left p-3 font-medium">Product</th>
                <th className="text-left p-3 font-medium">Category</th>
                <th className="text-left p-3 font-medium">Price</th>
                <th className="text-left p-3 font-medium">Colors</th>
                <th className="text-left p-3 font-medium">Stock</th>
                <th className="text-left p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p)=>(
                <tr key={p._id||p.id} className="border-t border-gray-100 dark:border-zinc-800 hover:bg-gray-50 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/50">
                  <td className="p-3">
                    <div className="flex gap-3">
                      <img src={p.images?.[0]} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 dark:bg-zinc-800 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="font-medium line-clamp-1 text-black dark:text-white text-sm max-w-[180px]">{p.name}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400">{p.brand} • {p.sku||"No SKU"} • {p.images?.length||0} imgs</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 capitalize text-gray-600 dark:text-zinc-400 text-xs">{p.category}</td>
                  <td className="p-3 font-medium text-black dark:text-white text-sm">{formatPrice(p.price)}</td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      {(p.colors||[]).slice(0,3).map((c:any,i:number)=><span key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-900 shadow-sm ring-1 ring-gray-100 dark:ring-zinc-800" style={{background:c.hex}} title={c.name}></span>)}
                      {(p.colors?.length||0)>3 && <span className="text-xs text-gray-400">+{p.colors.length-3}</span>}
                      {(!p.colors||p.colors.length===0) && <span className="text-xs text-gray-400">Default</span>}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock>10?"bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400":"bg-amber-50 text-amber-700"}`}>{p.stock}</span>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <button onClick={()=>handleEdit(p)} className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:bg-zinc-900 dark:hover:text-black dark:text-white transition text-xs">✎</button>
                      <button onClick={()=>handleDelete(p._id||p.id)} className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-red-500 hover:text-white transition text-xs">🗑</button>
                      <a href={`/product/${p.slug}`} target="_blank" className="w-7 h-7 rounded-full border border-gray-200 dark:border-zinc-700 flex items-center justify-center hover:bg-blue-500 hover:text-white transition text-xs">↗</a>
                    </div>
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