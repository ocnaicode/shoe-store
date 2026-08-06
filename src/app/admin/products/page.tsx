"use client";
import { useState, useEffect } from "react";
import { products as initialProducts } from "@/lib/data";
import { formatPrice } from "@/lib/utils";

type Product = any;
type Variant = { size: number; stock: number; price?: number; sku?: string };

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
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
    { size: 38, stock: 10, price: undefined },
    { size: 39, stock: 15, price: undefined },
    { size: 40, stock: 20, price: undefined },
    { size: 41, stock: 15, price: undefined },
    { size: 42, stock: 10, price: undefined },
  ]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (d.products && d.products.length) setProducts(d.products);
      })
      .catch(() => {});
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const fd = new FormData();
        fd.append("file", files[i]);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.secure_url || data.url) {
          setForm((prev) => ({ ...prev, images: [...prev.images, data.secure_url || data.url] }));
        } else {
          alert("Upload failed: " + (data.error || "Unknown"));
        }
      }
    } catch (err: any) {
      alert("Upload error: " + err.message);
    }
    setUploading(false);
    // Reset input
    e.target.value = "";
  };

  const handleVariantChange = (idx: number, field: keyof Variant, value: any) => {
    const updated = [...variants];
    (updated[idx] as any)[field] = field === "size" || field === "stock" ? Number(value) : value;
    setVariants(updated);
  };

  const addVariant = () => setVariants([...variants, { size: 43, stock: 10 }]);
  const removeVariant = (idx: number) => setVariants(variants.filter((_, i) => i !== idx));

  const handleSave = async () => {
    if (!form.name || !form.price) return alert("Name and price required");
    if (form.images.length === 0) return alert("Please upload at least one image (Cloudinary)");
    setSaving(true);
    const sizes = variants.map((v) => v.size);
    const totalStock = variants.reduce((a, b) => a + Number(b.stock || 0), 0) || Number(form.stock) || 0;
    
    const payload: any = {
      name: form.name,
      slug: form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + (editing ? "" : "-" + Date.now().toString().slice(-4)),
      description: form.description || "Premium shoe from HOKO Lifestyle BD",
      price: Number(form.price),
      comparePrice: form.comparePrice ? Number(form.comparePrice) : undefined,
      category: form.category,
      brand: form.brand,
      stock: totalStock,
      sizes,
      variants: form.isVariable ? variants.map(v=> ({ size: v.size, stock: Number(v.stock), price: v.price ? Number(v.price) : Number(form.price), sku: v.sku || `${form.name.slice(0,3).toUpperCase()}-${v.size}` })) : undefined,
      colors: [{ name: "Default", hex: "#111111" }],
      images: form.images,
      sku: form.sku || `HOKO-${Date.now().toString().slice(-6)}`,
      material: form.material || "Synthetic Leather",
      rating: 4.5,
      reviews: 0,
    };

    try {
      if (editing) {
        // Update - for now delete and recreate or patch
        await fetch(`/api/products`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        // Remove old
        setProducts((prev) => prev.filter(p=> p._id !== editing._id));
        setProducts((prev) => [payload, ...prev]);
        alert("Product updated! (Demo: recreated)");
      } else {
        const res = await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (data.product) {
          setProducts((prev) => [data.product, ...prev]);
          alert("✅ Product added with Cloudinary images & variable sizes!");
        } else {
          setProducts((prev) => [{ ...payload, _id: Date.now().toString(), createdAt: new Date().toISOString() }, ...prev]);
          alert("✅ Product added (fallback)!");
        }
      }
      setShowAdd(false);
      setEditing(null);
      setForm({ name: "", price: "", comparePrice: "", category: "sneakers", brand: "HOKO", description: "", sku: "", material: "", stock: "", images: [], isVariable: true });
      setVariants([{ size: 38, stock: 10 }, { size: 39, stock: 15 }, { size: 40, stock: 20 }, { size: 41, stock: 15 }, { size: 42, stock: 10 }]);
    } catch (e: any) {
      alert("Error: " + e.message);
    }
    setSaving(false);
  };

  const handleEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : "",
      category: p.category,
      brand: p.brand,
      description: p.description,
      sku: p.sku || "",
      material: p.material || "",
      stock: String(p.stock),
      images: p.images || [],
      isVariable: !!p.variants,
    });
    if (p.variants && p.variants.length) setVariants(p.variants);
    else if (p.sizes) setVariants(p.sizes.map((s:number)=> ({ size: s, stock: 10 })));
    setShowAdd(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product? This will remove from MongoDB Atlas.")) return;
    // Try API delete (if exists) else just filter
    try {
      await fetch(`/api/products?id=${id}`, { method: "DELETE" });
    } catch {}
    setProducts((prev) => prev.filter((p) => p._id !== id && p.id !== id));
  };

  const handleImportDemo = async () => {
    if (!confirm("Import 8 demo products? Existing demo products will be skipped.")) return;
    setImporting(true);
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = await res.json();
      alert(`✅ ${data.inserted} products imported, ${data.skipped} skipped (${data.source})`);
      // Refresh
      const refreshed = await fetch("/api/products").then(r=>r.json());
      if(refreshed.products) setProducts(refreshed.products);
    } catch(e:any){ alert(e.message); }
    setImporting(false);
  };

  const handleClearDemo = async () => {
    if (!confirm("Delete all demo products (those with demo slugs)?")) return;
    setImporting(true);
    try {
      const res = await fetch("/api/seed", { method: "DELETE" });
      const data = await res.json();
      alert(`🗑️ ${data.deleted} demo products deleted`);
      const refreshed = await fetch("/api/products").then(r=>r.json());
      if(refreshed.products) setProducts(refreshed.products);
      else setProducts([]);
    } catch(e:any){ alert(e.message); }
    setImporting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black">Products • Variable + Cloudinary</h2>
          <p className="text-sm text-gray-500">Multiple images → Cloudinary CDN • Variable sizes with stock per size • SEO optimized</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleImportDemo} disabled={importing} className="bg-blue-600 text-white font-bold px-5 py-3 rounded-full hover:bg-blue-700 disabled:opacity-50 text-sm">
            {importing ? "..." : "📥 Import Demo (8)"}
          </button>
          <button onClick={handleClearDemo} disabled={importing} className="border border-red-200 text-red-600 font-bold px-5 py-3 rounded-full hover:bg-red-50 text-sm">
            🗑️ Clear Demo
          </button>
          <button onClick={() => { setShowAdd(!showAdd); setEditing(null); setForm({ name: "", price: "", comparePrice: "", category: "sneakers", brand: "HOKO", description: "", sku: "", material: "", stock: "", images: [], isVariable: true }); }} className="bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-zinc-800 text-sm">
            {showAdd ? "Cancel" : "+ Add Variable Product"}
          </button>
        </div>
      </div>

      {showAdd && (
        <div className="bg-white rounded-2xl p-6 border">
          <h3 className="font-black text-lg">{editing ? "Edit Product" : "Add New Variable Shoe"}</h3>
          <p className="text-xs text-gray-500">Shoe er onek size thake - protita size er stock alada dite parben. Sob image Cloudinary te upload hobe.</p>
          
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <label>
              <span className="text-xs font-bold">Product Name *</span>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. HOKO Air Runner Pro" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label>
              <span className="text-xs font-bold">Brand</span>
              <select value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm bg-white">
                <option>HOKO</option>
                <option>Nike</option>
                <option>Adidas</option>
                <option>Puma</option>
                <option>Bata</option>
                <option>Apex</option>
                <option>Lotto</option>
                <option>Woodland</option>
              </select>
            </label>
            <label>
              <span className="text-xs font-bold">Base Price (৳) *</span>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="4590" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label>
              <span className="text-xs font-bold">Compare Price (৳) - Discount show</span>
              <input type="number" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} placeholder="5990" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label>
              <span className="text-xs font-bold">Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm bg-white">
                <option value="sneakers">Sneakers</option>
                <option value="formal">Formal</option>
                <option value="boots">Boots</option>
                <option value="sports">Sports</option>
                <option value="casual">Casual</option>
                <option value="loafers">Loafers</option>
              </select>
            </label>
            <label>
              <span className="text-xs font-bold">SKU</span>
              <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="Auto: HOKO-123456" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label>
              <span className="text-xs font-bold">Material</span>
              <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} placeholder="Genuine Leather / Mesh" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
            <label className="flex items-center gap-2 mt-7">
              <input type="checkbox" checked={form.isVariable} onChange={e=> setForm({...form, isVariable: e.target.checked})} className="accent-black w-5 h-5" />
              <span className="font-bold text-sm">Variable Product (Size wise stock)</span>
            </label>
            <label className="md:col-span-2">
              <span className="text-xs font-bold">Description (SEO)</span>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Premium shoe description for Google ranking..." rows={3} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
          </div>

          {form.isVariable && (
            <div className="mt-6 border-2 rounded-2xl p-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <h4 className="font-black">📏 Variable Sizes & Stock</h4>
                <button type="button" onClick={addVariant} className="bg-black text-white px-4 py-1.5 rounded-full text-xs font-bold">+ Add Size</button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Protita size er jonno alada stock & price (optional) dite paren. Total stock auto calculate hobe.</p>
              <div className="mt-4 space-y-2">
                {variants.map((v, idx)=> (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-white p-3 rounded-xl border">
                    <div className="col-span-3">
                      <label className="text-xs font-bold">Size (EU)</label>
                      <input type="number" value={v.size} onChange={e=> handleVariantChange(idx, "size", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs font-bold">Stock</label>
                      <input type="number" value={v.stock} onChange={e=> handleVariantChange(idx, "stock", e.target.value)} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="col-span-3">
                      <label className="text-xs font-bold">Price override (৳)</label>
                      <input type="number" value={v.price || ""} onChange={e=> handleVariantChange(idx, "price", e.target.value)} placeholder={form.price || "Base"} className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs font-bold">SKU</label>
                      <input value={v.sku || ""} onChange={e=> handleVariantChange(idx, "sku", e.target.value)} placeholder="Auto" className="w-full mt-1 border rounded-lg px-3 py-2 text-sm" />
                    </div>
                    <div className="col-span-1 flex items-end">
                      <button type="button" onClick={()=> removeVariant(idx)} className="w-full bg-red-50 text-red-600 rounded-lg py-2 text-sm font-bold hover:bg-red-100">×</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs font-bold bg-white p-3 rounded-xl border">
                Total Stock: <span className="text-lg">{variants.reduce((a,b)=> a+ Number(b.stock||0),0)}</span> units • Sizes: {variants.map(v=>v.size).join(", ")}
              </div>
            </div>
          )}

          {!form.isVariable && (
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <label>
                <span className="text-xs font-bold">Total Stock</span>
                <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="50" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
              </label>
              <div className="text-xs text-gray-500 mt-7">Simple product er jonno total stock</div>
            </div>
          )}

          <div className="mt-6">
            <span className="text-xs font-bold">Product Images (Multiple - Cloudinary) *</span>
            <div className="mt-2 border-2 border-dashed rounded-2xl p-6 text-center bg-gray-50">
              <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="w-12 h-12 bg-black text-white rounded-xl flex items-center justify-center mx-auto text-xl">↑</div>
                <div className="font-bold text-sm mt-2">{uploading ? "Uploading to Cloudinary..." : "Click to Upload Multiple Images"}</div>
                <div className="text-xs text-gray-500">PNG, JPG up to 10MB • Auto-upload to Cloudinary folder: hokolifestylebd • Multiple select allowed</div>
              </label>

              {form.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt="" className="w-full h-32 object-cover rounded-xl border" />
                      <div className="absolute top-2 left-2 bg-black text-white text-xs px-2 py-0.5 rounded-full font-bold">#{i+1}</div>
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full text-sm flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                      <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] p-1 rounded text-center truncate">Cloudinary ✓</div>
                    </div>
                  ))}
                </div>
              )}
              {uploading && <div className="mt-3 text-xs text-amber-600 font-bold animate-pulse">Uploading {form.images.length} images to Cloudinary... Please wait</div>}
              <div className="text-xs text-gray-500 mt-3">First image will be thumbnail • Drag to reorder (future) • {form.images.length} image(s) selected</div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleSave} disabled={saving || uploading} className="flex-1 bg-black text-white font-bold py-3 rounded-full hover:bg-zinc-800 transition disabled:opacity-50">
              {saving ? "Saving to Atlas..." : editing ? "Update Product" : "Save Variable Product"}
            </button>
            <button onClick={() => { setShowAdd(false); setEditing(null);}} className="px-8 border rounded-full font-bold hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="font-black">All Products ({products.length}) - Editable</h3>
          <div className="flex gap-2">
            <input placeholder="Search products..." className="border rounded-full px-4 py-2 text-sm hidden md:block" />
            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-2 rounded-full font-bold">Atlas: {products.length} items</span>
          </div>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500">
              <tr>
                <th className="text-left p-4 font-bold">Image</th>
                <th className="text-left p-4 font-bold">Name / SKU</th>
                <th className="text-left p-4 font-bold">Category</th>
                <th className="text-left p-4 font-bold">Price</th>
                <th className="text-left p-4 font-bold">Variants</th>
                <th className="text-left p-4 font-bold">Stock</th>
                <th className="text-left p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id || p.id} className="border-t hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex -space-x-2">
                      {(p.images || []).slice(0,3).map((img:string, idx:number)=> (
                        <img key={idx} src={img} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100 border-2 border-white" />
                      ))}
                      {p.images?.length > 3 && <span className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center text-xs font-bold border-2 border-white">+{p.images.length-3}</span>}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{p.images?.length || 0} imgs • Cloudinary</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold line-clamp-1 max-w-[180px]">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.brand} • {p.sku || "No SKU"}</div>
                  </td>
                  <td className="p-4 capitalize">{p.category}</td>
                  <td className="p-4 font-black">{formatPrice(p.price)} {p.comparePrice && <span className="text-xs line-through text-gray-400">{formatPrice(p.comparePrice)}</span>}</td>
                  <td className="p-4">
                    {p.variants ? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold">{p.variants.length} sizes</span> : <span className="text-xs">{p.sizes?.join(", ")}</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${p.stock > 10 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{p.stock} in stock</span>
                    {p.variants && <div className="text-xs text-gray-500">{p.variants.map((v:any)=> `${v.size}:${v.stock}`).join(" ")}</div>}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(p)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-black hover:text-white transition" title="Edit">
                        ✏️
                      </button>
                      <button onClick={() => handleDelete(p._id || p.id)} className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-red-500 hover:text-white hover:border-red-500 transition" title="Delete">
                        🗑️
                      </button>
                      <a href={`/product/${p.slug}`} target="_blank" className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-blue-500 hover:text-white transition" title="View">👁️</a>
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
