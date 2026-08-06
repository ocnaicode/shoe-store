"use client";
import { useState, useMemo, Suspense } from "react";
import { products, categories, brands } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { useSearchParams } from "next/navigation";

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "all";

  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("featured");
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => {
    let res = [...products];
    if (selectedCategory !== "all") res = res.filter((p) => p.category === selectedCategory);
    if (selectedBrands.length) res = res.filter((p) => selectedBrands.includes(p.brand));
    res = res.filter((p) => p.price >= priceRange[0] && p.price <= priceRange[1]);
    if (selectedSizes.length) res = res.filter((p) => p.sizes.some((s) => selectedSizes.includes(s)));
    if (sortBy === "price-low") res.sort((a, b) => a.price - b.price);
    if (sortBy === "price-high") res.sort((a, b) => b.price - a.price);
    if (sortBy === "rating") res.sort((a, b) => b.rating - a.rating);
    if (sortBy === "newest") res.sort((a, b) => (a.isNew ? -1 : 1));
    return res;
  }, [selectedCategory, selectedBrands, priceRange, selectedSizes, sortBy]);

  const toggleBrand = (b: string) => setSelectedBrands((prev) => (prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]));
  const toggleSize = (s: number) => setSelectedSizes((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  return (
    <>
      <div className="bg-white border-b">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
          <div className="text-xs text-gray-500">Home / Shop {selectedCategory !== "all" && `/ ${selectedCategory}`}</div>
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mt-3">
            <div>
              <h1 className="text-3xl font-black capitalize">{selectedCategory === "all" ? "All Shoes" : selectedCategory}</h1>
              <p className="text-gray-600 text-sm mt-1">{filtered.length} products found • Premium collection for every occasion</p>
            </div>
            <div className="flex items-center gap-3">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border border-gray-200 rounded-full px-4 py-2.5 text-sm bg-white font-medium">
                <option value="featured">Featured</option>
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold">
                Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex gap-6">
          <aside className={`${showFilters ? "block" : "hidden"} lg:block w-full lg:w-[280px] shrink-0`}>
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-[90px] space-y-6 max-h-[calc(100vh-100px)] overflow-y-auto">
              <div>
                <h3 className="font-black text-sm tracking-widest mb-3">CATEGORIES</h3>
                <div className="space-y-1">
                  <button onClick={() => setSelectedCategory("all")} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between ${selectedCategory === "all" ? "bg-black text-white font-bold" : "hover:bg-gray-100"}`}>
                    All Shoes <span className="opacity-60">{products.length}</span>
                  </button>
                  {categories.map((c) => (
                    <button key={c.slug} onClick={() => setSelectedCategory(c.slug)} className={`w-full text-left px-3 py-2 rounded-lg text-sm flex justify-between capitalize ${selectedCategory === c.slug ? "bg-black text-white font-bold" : "hover:bg-gray-100"}`}>
                      {c.name} <span className="opacity-60">{products.filter((p) => p.category === c.slug).length}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-black text-sm tracking-widest mb-3">PRICE RANGE</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input type="number" value={priceRange[0]} onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Min" />
                    <span>-</span>
                    <input type="number" value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="Max" />
                  </div>
                  <input type="range" min={0} max={10000} step={500} value={priceRange[1]} onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])} className="w-full accent-black" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>৳{priceRange[0]}</span>
                    <span>৳{priceRange[1]}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[
                      [0, 3000],
                      [3000, 5000],
                      [5000, 7000],
                      [7000, 10000],
                    ].map((r) => (
                      <button key={r.join("-")} onClick={() => setPriceRange(r as [number, number])} className="border rounded-full py-1.5 hover:bg-black hover:text-white transition">
                        ৳{r[0]} - ৳{r[1]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-black text-sm tracking-widest mb-3">BRANDS</h3>
                <div className="space-y-2">
                  {brands.map((b) => (
                    <label key={b} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} className="rounded accent-black" />
                      {b}
                    </label>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-black text-sm tracking-widest mb-3">SIZE</h3>
                <div className="grid grid-cols-4 gap-2">
                  {[38, 39, 40, 41, 42, 43, 44, 45].map((s) => (
                    <button key={s} onClick={() => toggleSize(s)} className={`border rounded-lg py-2 text-sm font-bold ${selectedSizes.includes(s) ? "bg-black text-white border-black" : "bg-white hover:border-black"}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-black text-sm tracking-widest mb-3">COLOR</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: "Black", hex: "#111" },
                    { name: "White", hex: "#fff" },
                    { name: "Brown", hex: "#92400e" },
                    { name: "Blue", hex: "#2563eb" },
                    { name: "Red", hex: "#dc2626" },
                    { name: "Green", hex: "#16a34a" },
                  ].map((c) => (
                    <button key={c.name} title={c.name} className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-gray-200 shadow-sm" style={{ background: c.hex }}></button>
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
                className="w-full border border-gray-200 rounded-full py-2.5 text-sm font-bold hover:bg-black hover:text-white transition"
              >
                Clear All Filters
              </button>
            </div>
          </aside>

          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border">
                <div className="text-5xl mb-4">👟</div>
                <h3 className="font-black text-xl">No products found</h3>
                <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {filtered.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            )}
            <div className="flex justify-center gap-2 mt-10">
              <button className="w-10 h-10 rounded-full bg-black text-white font-bold">1</button>
              <button className="w-10 h-10 rounded-full border bg-white hover:bg-gray-50">2</button>
              <button className="w-10 h-10 rounded-full border bg-white hover:bg-gray-50">3</button>
              <span className="w-10 h-10 flex items-center justify-center">...</span>
              <button className="w-10 h-10 rounded-full border bg-white hover:bg-gray-50">→</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function ShopClientWrapper() {
  return (
    <Suspense fallback={<div className="p-12 text-center">Loading shop...</div>}>
      <ShopContent />
    </Suspense>
  );
}
