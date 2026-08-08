"use client";
import { useState, useEffect } from "react";
import { Product } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/lib/store";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";

export default function ProductClient({ product, related }: { product: any; related: any[] }) {
  const [activeImage, setActiveImage] = useState(0);
  const hasVariants = product.variants && product.variants.length > 0;
  const initialSize = hasVariants ? product.variants[0].size : (product.sizes?.[2] || product.sizes?.[0] || 42);
  const [selectedSize, setSelectedSize] = useState<number>(initialSize);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0]?.name || "");
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState<"desc" | "shipping">("desc");
  const [flashSale, setFlashSale] = useState<any>(null);

  const addToCart = useStore((s) => s.addToCart);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const isWished = wishlist.includes(product._id || product.id);

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(d=>{
      if(d.flashSale?.enabled) {
        const ids = d.flashSale.productIds || [];
        if(ids.length===0 || ids.includes(product._id)) setFlashSale(d.flashSale);
      }
    }).catch(()=>{});
  }, [product._id]);

  const selectedVariant = hasVariants ? product.variants.find((v:any)=> v.size === selectedSize) : null;
  const variantPrice = selectedVariant?.price || product.price;
  const variantStock = selectedVariant?.stock ?? product.stock;
  const displayPrice = flashSale ? Math.round(variantPrice * (1 - flashSale.discountPercent/100)) : variantPrice;

  const handleAdd = () => {
    if (variantStock !== undefined && variantStock < qty) return alert(`Only ${variantStock} left for size ${selectedSize}`);
    addToCart({
      id: product._id || product.id,
      slug: product.slug,
      name: product.name,
      price: displayPrice,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity: qty,
    });
    const el = document.getElementById("toast");
    if (el) {
      el.classList.remove("hidden");
      setTimeout(() => el.classList.add("hidden"), 2500);
    }
  };

  return (
    <div className="bg-white dark:bg-black">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4 text-xs text-gray-500 dark:text-zinc-400">
        <Link href="/" className="hover:text-black dark:hover:text-white">Home</Link> / <Link href="/shop" className="hover:text-black dark:hover:text-white">Shop</Link> / <span className="text-black dark:text-white font-medium">{product.name}</span>
      </div>

      {flashSale && (
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-3">
              <span className="bg-white dark:bg-zinc-900 text-red-600 font-black px-3 py-1 rounded-full text-xs">⚡ FLASH SALE</span>
              <span className="font-bold">{flashSale.title}</span>
              <span className="bg-black text-white px-3 py-1 rounded-full text-sm font-black">{flashSale.discountPercent}% OFF</span>
            </div>
            <div className="text-xs font-bold">Hurry! Variable product flash price applied</div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 pb-12 pt-4">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          <div>
            <div className="bg-[#f8f8f8] dark:bg-zinc-900 rounded-3xl overflow-hidden aspect-square relative">
              <img src={product.images[activeImage]} alt={product.name} className="w-full h-full object-cover" />
              {product.comparePrice && (
                <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  SAVE {formatPrice(product.comparePrice - product.price)}
                </span>
              )}
              {flashSale && <span className="absolute top-4 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black text-xs font-black px-4 py-1.5 rounded-full">FLASH {flashSale.discountPercent}% OFF</span>}
              <button onClick={() => toggleWishlist(product._id || product.id)} className={`absolute top-4 right-4 w-11 h-11 rounded-full flex items-center justify-center backdrop-blur ${isWished ? "bg-red-500 text-white" : "bg-white/90 dark:bg-zinc-800/90"}`}>
                <svg className="w-5 h-5" fill={isWished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
              <div className="absolute bottom-4 left-4 bg-black/70 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur">
                {product.images.length} images • Cloudinary
              </div>
            </div>
            <div className="flex gap-3 mt-4 overflow-auto pb-2">
              {product.images.map((img:string, i:number) => (
                <button key={i} onClick={() => setActiveImage(i)} className={`w-20 h-20 rounded-2xl overflow-hidden border-2 shrink-0 ${activeImage === i ? "border-black dark:border-white" : "border-transparent opacity-70"}`}>
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              {[
                { title: "Free Delivery", desc: "Over ৳3000" },
                { title: "7 Days Return", desc: "Easy exchange" },
                { title: "Original", desc: "100% Authentic" },
              ].map((f) => (
                <div key={f.title} className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-4 text-center border dark:border-zinc-800">
                  <div className="font-bold text-sm text-black dark:text-white">{f.title}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold tracking-widest text-amber-600 uppercase">{product.brand} • {product.category} {hasVariants && "• VARIABLE"}</div>
            <h1 className="text-3xl lg:text-4xl font-black mt-2 leading-tight text-black dark:text-white">{product.name}</h1>

            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <div className="flex text-amber-500 text-sm">{"★★★★★".slice(0, Math.round(product.rating || 4.5))}<span className="text-gray-300 dark:text-zinc-700">{"★★★★★".slice(Math.round(product.rating || 4.5))}</span></div>
              <span className="text-sm font-medium text-black dark:text-white">{product.rating || 4.5}</span>
              <span className="text-sm text-gray-500 dark:text-zinc-400">({product.reviews || 0} reviews)</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${variantStock > 10 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : variantStock > 0 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "bg-red-100 dark:bg-red-900/30 text-red-700"}`}>
                {variantStock > 0 ? `In Stock • ${variantStock} left (Size ${selectedSize})` : "Out of Stock"}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-6 flex-wrap">
              <span className="text-4xl font-black text-black dark:text-white">{formatPrice(displayPrice)}</span>
              {flashSale ? (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(variantPrice)}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{flashSale.discountPercent}% OFF</span>
                </>
              ) : product.comparePrice ? (
                <>
                  <span className="text-xl text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">{Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)}% OFF</span>
                </>
              ) : null}
            </div>
            {selectedVariant?.price && selectedVariant.price !== product.price && <div className="text-sm text-blue-600 dark:text-blue-400 font-bold">Variant price for size {selectedSize}</div>}
            <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">SKU: {selectedVariant?.sku || product.sku || "HOKO-"+(product._id||"").slice(-6)} • Inclusive of VAT</div>

            <div className="mt-8">
              <h3 className="font-bold text-sm text-black dark:text-white">COLOR: <span className="font-normal text-gray-600 dark:text-zinc-400">{selectedColor}</span></h3>
              <div className="flex gap-2 mt-3">
                {(product.colors || []).map((c:any) => (
                  <button key={c.name} onClick={() => setSelectedColor(c.name)} className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${selectedColor === c.name ? "border-black dark:border-white scale-110" : "border-white dark:border-zinc-800 ring-1 ring-gray-200 dark:ring-zinc-700"}`} style={{ background: c.hex }} title={c.name}>
                    {selectedColor === c.name && <span className="w-2 h-2 bg-white dark:bg-zinc-900 rounded-full ring-1 ring-black/20"></span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-black dark:text-white">SIZE (EU) {hasVariants && <span className="text-amber-600">• Variable Stock</span>}</h3>
                <a href="#" className="text-xs underline font-medium dark:text-zinc-400">Size Guide</a>
              </div>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {(hasVariants ? product.variants : (product.sizes || []).map((s:number)=> ({size:s, stock: product.stock})) ).map((v:any) => {
                  const size = v.size;
                  const stock = v.stock;
                  const isSelected = selectedSize === size;
                  const outOfStock = stock === 0;
                  return (
                    <button
                      key={size}
                      onClick={() => !outOfStock && setSelectedSize(size)}
                      disabled={outOfStock}
                      className={`border rounded-xl py-3 font-bold text-sm relative ${outOfStock ? "bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-600 cursor-not-allowed border-gray-200 dark:border-zinc-700" : isSelected ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-zinc-900 hover:border-black dark:hover:border-white text-black dark:text-white"}`}
                    >
                      {size}
                      <span className="block text-[10px] font-normal">{outOfStock ? "Out" : `${stock} left`}</span>
                    </button>
                  );
                })}
              </div>
              <div className="text-xs text-gray-500 dark:text-zinc-400 mt-2">Selected: Size {selectedSize} • Stock {variantStock} • {variantStock < 5 && variantStock > 0 ? "Hurry! Only few left" : "In stock"}</div>
            </div>

            <div className="mt-8 flex gap-3">
              <div className="flex items-center border dark:border-zinc-700 rounded-full px-2 bg-white dark:bg-zinc-900">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-black dark:text-white">−</button>
                <span className="w-10 text-center font-bold text-black dark:text-white">{qty}</span>
                <button onClick={() => setQty(Math.min(variantStock, qty + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full text-black dark:text-white">+</button>
              </div>
              <button onClick={handleAdd} disabled={variantStock === 0} className="flex-1 bg-black dark:bg-white text-white dark:text-black font-black rounded-full py-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition disabled:opacity-50 disabled:cursor-not-allowed">
                {variantStock === 0 ? "OUT OF STOCK" : `ADD TO CART • ${formatPrice(displayPrice * qty)}`}
              </button>
            </div>
            <Link href="/checkout" onClick={handleAdd} className={`mt-3 w-full font-black rounded-full py-4 flex items-center justify-center gap-2 transition ${variantStock === 0 ? "bg-gray-300 dark:bg-zinc-700 text-gray-500 cursor-not-allowed pointer-events-none" : "bg-amber-500 hover:bg-amber-600 text-black dark:text-white"}`}>
              BUY NOW ⚡
            </Link>

            <div className="mt-10 border-t dark:border-zinc-800">
              <div className="flex gap-6 border-b dark:border-zinc-800">
                {[
                  { id: "desc", label: "Description" },
                  { id: "shipping", label: "Shipping & Returns" },
                ].map((t) => (
                  <button key={t.id} onClick={() => setTab(t.id as any)} className={`py-4 text-sm font-bold border-b-2 ${tab === t.id ? "border-black dark:border-white text-black dark:text-white" : "border-transparent text-gray-500 dark:text-zinc-500"}`}>
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="py-6 text-sm leading-relaxed text-gray-600 dark:text-zinc-300">
                {tab === "desc" && (
                  <div>
                    <p>{product.description}</p>
                    <ul className="list-disc ml-5 mt-4 space-y-1">
                      <li>Premium breathable upper material - {product.material || "Synthetic Leather"}</li>
                      <li>Cushioned insole for all-day comfort</li>
                      <li>Durable rubber outsole with grip</li>
                      <li>Variable sizes: {hasVariants ? product.variants.map((v:any)=> v.size).join(", ") : product.sizes?.join(", ")}</li>
                    </ul>
                  </div>
                )}
                {tab === "shipping" && (
                  <div>
                    <p><strong>Inside Dhaka:</strong> 1-2 days, ৳60 delivery</p>
                    <p><strong>Outside Dhaka:</strong> 2-4 days, ৳120 delivery via Steadfast Courier</p>
                    <p className="mt-2">7 days easy return if size issue or manufacturing defect. Product must be unused with tags.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <ReviewSection productId={product._id || product.id} productSlug={product.slug} />

        <div className="mt-16">
          <h2 className="text-2xl font-black mb-6 text-black dark:text-white">YOU MAY ALSO LIKE</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {related.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>
      </div>

      <div id="toast" className="hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full shadow-xl z-50 flex items-center gap-3">
        <span className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-sm">✓</span>
        Added to cart! <Link href="/cart" className="underline font-bold ml-2">View Cart</Link>
      </div>
    </div>
  );
}