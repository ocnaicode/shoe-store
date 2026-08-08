"use client";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const defaultSlides = [
  {
    badge: "NEW COLLECTION 2026 • UP TO 40% OFF",
    title: "STEP INTO",
    highlight: "COMFORT",
    subtitle: "& STYLE",
    desc: "বাংলাদেশের #১ প্রিমিয়াম শু স্টোর। Discover the latest sneakers, formal & sports shoes.",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=800&q=80",
    bg: "from-amber-100 to-orange-50",
    accent: "from-amber-500 to-orange-600",
    productName: "HOKO Air Max",
    productPrice: "৳4,590",
    productImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80",
    cta: "/shop",
    isActive: true,
  },
  {
    badge: "LIMITED EDITION • AIR MAX COLLECTION",
    title: "AIR MAX",
    highlight: "REVOLUTION",
    subtitle: "IS HERE",
    desc: "Revolutionary air cushioning with premium comfort for everyday wear.",
    image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=800&q=80",
    bg: "from-blue-100 to-indigo-50",
    accent: "from-blue-600 to-indigo-600",
    productName: "Air Max Pro",
    productPrice: "৳5,990",
    productImage: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=200&q=80",
    cta: "/shop?category=sneakers",
    isActive: true,
  },
  {
    badge: "FORMAL ELEGANCE • UP TO 30% OFF",
    title: "FORMAL",
    highlight: "ELEGANCE",
    subtitle: "REDEFINED",
    desc: "Handcrafted leather shoes for the modern gentleman. Office to party.",
    image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=800&q=80",
    bg: "from-stone-100 to-neutral-50",
    accent: "from-stone-700 to-zinc-900",
    productName: "Oxford Classic",
    productPrice: "৳6,890",
    productImage: "https://images.unsplash.com/photo-1614253429381-573710ca9e2a?w=200&q=80",
    cta: "/shop?category=formal",
    isActive: true,
  },
];

export default function Hero() {
  const [slides, setSlides] = useState(defaultSlides);

  useEffect(() => {
    fetch("/api/home-settings").then(r=>r.json()).then(d=>{
      if(d.heroSlides && d.heroSlides.length > 0){
        const active = d.heroSlides.filter((s:any)=> s.isActive !== false);
        if(active.length > 0) setSlides(active);
      }
    }).catch(()=>{});
  }, []);

  return (
    <section className="relative bg-[#f7f7f5] dark:bg-zinc-900 overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation
        loop={slides.length > 1}
        className="hero-swiper"
      >
        {slides.map((slide: any, idx: number) => (
          <SwiperSlide key={idx}>
            <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
              <div className="grid lg:grid-cols-2 gap-8 items-center py-8 lg:py-12 min-h-[560px]">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="relative z-10"
                >
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="inline-flex items-center gap-2 bg-white dark:bg-zinc-800 rounded-full px-4 py-1.5 text-xs font-bold tracking-widest border border-gray-200 dark:border-zinc-700 dark:text-white">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    {slide.badge}
                  </motion.div>
                  <h1 className="mt-6 text-[42px] lg:text-[64px] font-black leading-[0.9] tracking-tight text-black dark:text-white">
                    {slide.title}
                    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.6 }} className={`block text-transparent bg-clip-text bg-gradient-to-r ${slide.accent}`}>
                      {slide.highlight}
                    </motion.span>
                    <span className="block">{slide.subtitle}</span>
                  </h1>
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-4 text-gray-600 dark:text-zinc-400 max-w-lg leading-relaxed">
                    {slide.desc}
                  </motion.p>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-wrap gap-3 mt-8">
                    <Link href={slide.cta || "/shop"} className="bg-black dark:bg-white text-white dark:text-black font-bold px-8 py-4 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 transition flex items-center gap-2 group">
                      SHOP NOW <span className="bg-white dark:bg-black text-black dark:text-white rounded-full w-6 h-6 flex items-center justify-center text-sm group-hover:translate-x-1 transition">→</span>
                    </Link>
                    <Link href="/shop?filter=new" className="bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 font-bold px-8 py-4 rounded-full hover:bg-gray-50 dark:hover:bg-zinc-700 transition text-black dark:text-white">
                      NEW ARRIVALS
                    </Link>
                  </motion.div>

                  <div className="flex items-center gap-8 mt-10">
                    <div className="flex -space-x-3">
                      {[1, 2, 3].map((i) => (
                        <img key={i} src={`https://i.pravatar.cc/100?img=${10 + i}`} alt="" className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-900 object-cover" />
                      ))}
                      <div className="w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black border-2 border-white dark:border-zinc-900 flex items-center justify-center text-xs font-bold">+2k</div>
                    </div>
                    <div>
                      <div className="flex text-amber-500 text-sm">★★★★★ <span className="text-black dark:text-white ml-1 font-bold">4.9/5</span></div>
                      <div className="text-xs text-gray-500 dark:text-zinc-500">Trusted by 50,000+ customers</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="relative lg:h-[560px] flex items-center justify-center">
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} dark:from-zinc-800 dark:to-zinc-900 rounded-[32px] lg:rounded-[40px]`}></div>
                  <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.8 }} className="absolute top-6 right-6 bg-white dark:bg-zinc-800 rounded-2xl p-4 shadow-xl flex items-center gap-3 z-20 dark:border dark:border-zinc-700">
                    <img src={slide.productImage || slide.product?.image} alt="" className="w-14 h-14 rounded-xl object-cover" />
                    <div>
                      <div className="text-xs font-bold text-black dark:text-white">{slide.productName || slide.product?.name}</div>
                      <div className="text-xs text-gray-500 dark:text-zinc-400">Best Seller</div>
                      <div className="text-sm font-black text-black dark:text-white">{slide.productPrice || slide.product?.price}</div>
                    </div>
                    <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center">+</div>
                  </motion.div>

                  <div className="absolute bottom-6 left-6 bg-black dark:bg-white text-white dark:text-black rounded-2xl px-5 py-4 z-20">
                    <div className="text-xs tracking-widest opacity-60">LIMITED OFFER</div>
                    <div className="text-2xl font-black">40% OFF</div>
                    <div className="text-xs opacity-60">on selected items</div>
                  </div>

                  <motion.img
                    animate={{ y: [0, -10, 0], rotate: [-6, -4, -6] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    src={slide.image}
                    alt="Hero Shoe"
                    className="relative z-10 w-full max-w-[560px] object-contain drop-shadow-2xl"
                  />

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-amber-200/40 to-orange-200/40 dark:from-amber-900/20 dark:to-orange-900/20 rounded-full blur-3xl"></div>
                </motion.div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="bg-black dark:bg-zinc-900 text-white">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-4 grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          {[
            { icon: "🚚", title: "Free Delivery", desc: "Orders over ৳3000" },
            { icon: "↩️", title: "7 Days Return", desc: "Easy exchange" },
            { icon: "🔒", title: "Secure Payment", desc: "bKash • COD" },
            { icon: "⭐", title: "Original Products", desc: "100% authentic" },
          ].map((f, i) => (
            <motion.div key={f.title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg">{f.icon}</span>
              <div>
                <div className="font-bold text-sm">{f.title}</div>
                <div className="text-xs text-white/60">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
