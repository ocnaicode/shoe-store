import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import ProductSlider from "@/components/ProductSlider";
import { products, categories } from "@/lib/data";
import Link from "next/link";

export default function Home() {
  const featured = products.filter((p) => p.isFeatured);
  const bestSellers = products.filter((p) => p.isBestSeller);
  const newArrivals = products.filter((p) => p.isNew);

  return (
    <div className="bg-white dark:bg-black">
      <Hero />

      {/* Categories - Animated */}
      <section id="categories" className="max-w-[1400px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="text-xs font-bold tracking-[0.2em] text-amber-600">SHOP BY CATEGORY</div>
            <h2 className="text-3xl lg:text-4xl font-black mt-2 text-black dark:text-white">FIND YOUR PERFECT PAIR</h2>
          </div>
          <Link href="/shop" className="hidden md:inline-flex items-center gap-2 font-bold text-sm border border-black dark:border-white dark:text-white rounded-full px-6 py-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition">
            VIEW ALL → 
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat, i) => (
            <Link key={cat.slug} href={`/shop?category=${cat.slug}`} className="group">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-100 dark:bg-zinc-800">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute bottom-0 p-4 text-white">
                  <div className="font-black text-lg leading-none">{cat.name}</div>
                  <div className="text-xs opacity-80">{cat.count} Products</div>
                </div>
                <div className="absolute top-3 right-3 w-8 h-8 bg-white/20 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-sm">→</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products - Grid with animation */}
      <section className="bg-[#f7f7f5] dark:bg-zinc-900 py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="text-xs font-bold tracking-[0.2em] text-amber-600">FEATURED PRODUCTS</div>
              <h2 className="text-3xl font-black mt-2 text-black dark:text-white">TRENDING NOW</h2>
            </div>
            <Link href="/shop" className="hidden md:inline-flex bg-black dark:bg-white text-white dark:text-black font-bold rounded-full px-6 py-3 text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
              VIEW ALL PRODUCTS
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* Promo Banner - with hover animation */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative rounded-3xl overflow-hidden bg-black text-white p-8 lg:p-10 flex flex-col justify-center min-h-[320px] group hover:scale-[1.02] transition-transform duration-500">
            <img src="https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80" alt="" className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-50 transition" />
            <div className="relative">
              <div className="inline-block bg-amber-500 text-black text-xs font-black px-3 py-1 rounded-full animate-pulse">LIMITED EDITION</div>
              <h3 className="text-3xl lg:text-4xl font-black mt-3 leading-none">
                AIR MAX<br />
                COLLECTION
              </h3>
              <p className="text-white/70 mt-3 text-sm">Experience unmatched comfort with revolutionary air cushioning.</p>
              <Link href="/shop?category=sneakers" className="inline-flex mt-6 bg-white text-black font-bold px-6 py-3 rounded-full text-sm hover:bg-amber-500 transition">
                SHOP COLLECTION →
              </Link>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden bg-[#fff7ed] dark:bg-zinc-800 p-8 lg:p-10 flex flex-col justify-center min-h-[320px] border border-orange-100 dark:border-zinc-700 group hover:scale-[1.02] transition-transform duration-500">
            <h3 className="text-3xl lg:text-4xl font-black leading-none text-black dark:text-white">
              FORMAL<br />
              <span className="text-amber-600">ELEGANCE</span>
            </h3>
            <p className="text-gray-600 dark:text-zinc-400 mt-3 text-sm">Handcrafted leather shoes for the modern gentleman. Office to party.</p>
            <div className="flex gap-2 mt-6">
              <span className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-xs font-bold">UP TO 30% OFF</span>
              <Link href="/shop?category=formal" className="bg-black dark:bg-white text-white dark:text-black px-6 py-2 rounded-full text-sm font-bold hover:bg-zinc-800 transition">
                SHOP NOW
              </Link>
            </div>
            <img src="https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400&q=80" alt="" className="absolute right-0 bottom-0 w-[55%] h-full object-cover rounded-l-3xl hidden lg:block opacity-90 group-hover:scale-105 transition duration-700" />
          </div>
        </div>
      </section>

      {/* Best Sellers - Slider */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl lg:text-3xl font-black text-black dark:text-white">BEST SELLERS 🔥</h2>
          <Link href="/shop" className="text-sm font-bold underline dark:text-white">View All</Link>
        </div>
        <ProductSlider products={bestSellers.concat(products.slice(0, 4))} />
      </section>

      {/* New Arrivals - Dark Slider */}
      <section className="bg-black dark:bg-zinc-950 text-white py-12">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="text-center mb-10">
            <div className="text-amber-500 text-xs font-bold tracking-[0.2em]">NEW ARRIVALS</div>
            <h2 className="text-3xl font-black mt-2">FRESH DROPS THIS WEEK</h2>
            <p className="text-white/60 mt-2">Be the first to cop the latest styles</p>
          </div>
          <ProductSlider products={newArrivals.concat(products.slice(2, 4))} />
          <div className="mt-14 border-t border-white/10 pt-10">
            <div className="text-center text-xs tracking-[0.2em] font-bold text-white/40 mb-6">TRUSTED BRANDS</div>
            <div className="flex flex-wrap justify-center items-center gap-6 lg:gap-12 opacity-60">
              {["NIKE", "ADIDAS", "PUMA", "BATA", "APEX", "WOODLAND", "LOTTO", "HOKO"].map((b) => (
                <span key={b} className="text-xl lg:text-2xl font-black tracking-widest hover:text-amber-500 transition cursor-pointer">
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Slider */}
      <section className="bg-[#f7f7f5] dark:bg-zinc-900 py-12 lg:py-16">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="text-center mb-8">
            <div className="text-xs font-bold tracking-[0.2em] text-amber-600">TESTIMONIALS</div>
            <h2 className="text-3xl font-black mt-2 text-black dark:text-white">WHAT OUR CUSTOMERS SAY</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Rahim Ahmed", city: "Dhaka", review: "Best shoe collection in BD! Delivery was super fast and quality is top notch.", rating: 5, img: "https://i.pravatar.cc/100?img=11" },
              { name: "Fatima Khan", city: "Chittagong", review: "Love my new sneakers! Very comfortable and stylish. Will order again!", rating: 5, img: "https://i.pravatar.cc/100?img=12" },
              { name: "Sakib Hasan", city: "Sylhet", review: "Original products, easy return. HOKO is now my go-to shoe store.", rating: 5, img: "https://i.pravatar.cc/100?img=13" },
            ].map((t) => (
              <div key={t.name} className="bg-white dark:bg-zinc-800 rounded-3xl p-6 border dark:border-zinc-700 hover:shadow-xl transition">
                <div className="flex text-amber-500 text-sm">★★★★★</div>
                <p className="text-sm text-gray-600 dark:text-zinc-300 mt-3 leading-relaxed">"{t.review}"</p>
                <div className="flex items-center gap-3 mt-4">
                  <img src={t.img} alt="" className="w-10 h-10 rounded-full" />
                  <div>
                    <div className="font-bold text-sm text-black dark:text-white">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-zinc-400">{t.city} • Verified Buyer</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="max-w-[1400px] mx-auto px-4 lg:px-6 py-12 lg:py-16">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { title: "100% Original", desc: "All products are genuine and come with brand warranty. No replicas, ever.", icon: "✓" },
            { title: "Cash on Delivery", desc: "Pay when you receive. Available across all 64 districts in Bangladesh.", icon: "₿" },
            { title: "Easy Returns", desc: "7-day hassle-free return & exchange. Your satisfaction is our priority.", icon: "↺" },
          ].map((f) => (
            <div key={f.title} className="bg-gray-50 dark:bg-zinc-800 rounded-3xl p-8 text-center hover:scale-105 transition-transform duration-300 border dark:border-zinc-700">
              <div className="w-14 h-14 bg-black dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center text-xl font-black mx-auto">{f.icon}</div>
              <h3 className="font-black text-lg mt-4 text-black dark:text-white">{f.title}</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-400 mt-2 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Instagram */}
      <section className="bg-[#f7f7f5] dark:bg-zinc-900 py-10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl text-black dark:text-white">FOLLOW US ON INSTAGRAM @hokolifestylebd</h3>
            <a href="#" className="hidden md:inline-flex font-bold text-sm border border-black dark:border-white dark:text-white rounded-full px-5 py-2 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition">
              FOLLOW →
            </a>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-gray-200 dark:bg-zinc-800 group">
                <img src={`https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80&random=${i}`} alt="" className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
