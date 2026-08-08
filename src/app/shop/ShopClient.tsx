"use client";
import { useState, useMemo, Suspense } from "react";
import { products, categories, brands } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";
  const searchQuery = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let res = [...products];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      res = res.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (selectedCategory !== "all") res = res.filter((p) => p.category === selectedCategory);
    if (selectedBrands.length) res = res.filter((p) => selectedBrands.includes(p.brand));
    res = res.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedSizes.length) res = res.filter((p) => p.sizes?.some((s) => selectedSizes.includes(s)) || (p as any).variants?.some((v:any)=> selectedSizes.includes(v.size)));
    if (sortBy === "price-low") res.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") res.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") res.sort((a, b) => b.rating - a.rating);
    if (sortBy === "newest") res.sort((a, b) => (a.isNew ? -1 : 1));
    return res;
  }, [selectedCategory, selectedBrands, priceRange, selectedSizes, sortBy, searchQuery]);

  const toggleBrand = (b: string) => setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  const toggleSize = (s: number) => setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <>
      <div className="bg-white dark:bg-black border-b border-gray-100 dark:border-zinc-800">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
          <div className="text-xs text-gray-400">Home / Shop {selectedCategory !== "all" && `/ ${selectedCategory}`} {searchQuery && `• Search: "${searchQuery}"`}</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-2">
            <div>
              <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight capitalize text-black dark:text-white">{searchQuery ? `Search: "${searchQuery}"` : selectedCategory === "all" ? "All Shoes" : selectedCategory}</h1>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{filtered.length} products {searchQuery && `for "${searchQuery}"`} • Curated for you</p>
            </div>
            <div className="flex items-center gap-2">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 dark:border-zinc-800 rounded-full px-4 py-2 text-sm bg-white dark:bg-zinc-900 font-medium text-black dark:text-white">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <button onClick={() => setShowFilters(true)} className="lg:hidden border border-gray-200 dark:border-zinc-700 rounded-full px-5 py-2 text-sm font-medium flex items-center gap-2 text-black dark:text-white">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m-6 4h4" /></svg>
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-100 dark:border-zinc-800 p-5 sticky top-[80px] space-y-6">
              <div>
                <h3 className="font-medium text-sm mb-3 text-black dark:text-white">Category</h3>
                <div className="space-y-1">
                  <button onClick={() => setSelectedCategory("all")} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between transition ${selectedCategory === "all" ? "bg-black dark:bg-white text-white dark:text-black font-medium" : "hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"}`}>
                    All Shoes <span className="opacity-60 text-xs">{products.length}</span>
                  </button>
                  {categories.map((c) => (
                    <button key={c.slug} onClick={() => setSelectedCategory(c.slug)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between capitalize transition ${selectedCategory === c.slug ? "bg-black dark:bg-white text-white dark:text-black font-medium" : "hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"}`}>
                      {c.name} <span className="opacity-60 text-xs">{products.filter((p) => p.category === c.slug).length}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                <h3 className="font-medium text-sm mb-3 text-black dark:text-white">Price</h3>
                <div className="space-y-3">
                  <input type="range" min={0} max={10000} step={500} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-black dark:accent-white" />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-zinc-400">
                    <span>৳{priceRange[0]}</span>
                    <span>৳{priceRange[1]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[[0, 3000],[3000, 5000],[5000, 7000],[7000, 10000]].map((r) => (
                      <button key={r.join("-")} onClick={() => setPriceRange(r as [number, number])} className="border border-gray-200 dark:border-zinc-700 rounded-full py-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:bg-zinc-900 dark:hover:text-black transition text-gray-600 dark:text-zinc-400">
                        ৳{r[0]} - ৳{r[1]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                <h3 className="font-medium text-sm mb-3 text-black dark:text-white">Brand</h3>
                <div className="space-y-2">
                  {brands.map((b) => (
                    <label key={b} className="flex items-center gap-2 text-sm cursor-pointer group">
                      <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="rounded w-4 h-4 accent-black" />
                      <span className="text-gray-600 dark:text-zinc-400 group-hover:text-black dark:group-hover:text-white transition">{b}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-zinc-800 pt-6">
                <h3 className="font-medium text-sm mb-3 text-black dark:text-white">Size</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[38, 39, 40, 41, 42, 43, 44, 45].map((s) => (
                    <button key={s} onClick={() => toggleSize(s)} className={`border rounded-lg py-2 text-sm font-medium transition ${selectedSizes.includes(s) ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-600 text-gray-700 dark:text-zinc-300"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setSelectedCategory("all");
                  setSelectedBrands([]);
                  setPriceRange([0, 10000]);
                  setSelectedSizes([]);
                }}
                className="w-full border border-gray-200 dark:border-zinc-700 rounded-full py-2.5 text-sm font-medium hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-800 transition text-black dark:text-white"
              >
                Clear Filters
              </button>
            </div>
          </aside>

          {/* Mobile Drawer */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setShowFilters(false)} />
                <motion.aside initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }} className="fixed inset-y-0 left-0 w-[300px] bg-white dark:bg-zinc-900 z-50 lg:hidden overflow-auto p-5">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-black dark:text-white">Filters</h3>
                    <button onClick={() => setShowFilters(false)} className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center">×</button>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-sm mb-2 text-black dark:text-white">Category</h4>
                      <div className="space-y-1">
                        <button onClick={() => { setSelectedCategory("all"); setShowFilters(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${selectedCategory === "all" ? "bg-black text-white" : "hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-800"}`}>All Shoes</button>
                        {categories.map((c) => (
                          <button key={c.slug} onClick={() => { setSelectedCategory(c.slug); setShowFilters(false); }} className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize ${selectedCategory === c.slug ? "bg-black text-white" : "hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-800"}`}>{c.name}</button>
                        ))}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <h4 className="font-medium text-sm mb-2">Brand</h4>
                      {brands.map((b) => (
                        <label key={b} className="flex items-center gap-2 text-sm py-1">
                          <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="rounded" /> {b}
                        </label>
                      ))}
                    </div>
                    <button onClick={() => { setSelectedCategory("all"); setSelectedBrands([]); setPriceRange([0,10000]); setSelectedSizes([]); setShowFilters(false); }} className="w-full border rounded-full py-2.5 text-sm font-medium mt-4">Clear All</button>
                    <button onClick={() => setShowFilters(false)} className="w-full bg-black dark:bg-white text-white dark:text-black rounded-full py-3 font-medium mt-2">Show {filtered.length} Products</button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          <div className="flex-1 min-w-0">
            {filtered.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-xl p-12 text-center border border-gray-100 dark:border-zinc-800">
                <div className="text-4xl mb-3">👟</div>
                <h3 className="font-medium text-black dark:text-white">No products found</h3>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Try adjusting your filters</p>
                <button onClick={() => { setSelectedCategory("all"); setSelectedBrands([]); setPriceRange([0,10000]); setSelectedSizes([]); }} className="mt-4 border border-gray-200 dark:border-zinc-700 rounded-full px-6 py-2 text-sm font-medium">Clear Filters</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
                {filtered.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default function ShopClientWrapper() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-gray-500 dark:text-zinc-400">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}