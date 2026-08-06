"use client";
import Link from "next/link";
import { Product } from "@/lib/data";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useState } from "react";
import { motion } from "framer-motion";

export default function ProductCard({ product }: { product: any }) {
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const wishlist = useStore((s) => s.wishlist);
  const isWished = wishlist.includes(product._id || product.id);
  const [hovered, setHovered] = useState(false);

  const id = product._id || product.id;
  const price = product.price;
  const comparePrice = product.comparePrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 hover:border-gray-200 dark:hover:border-zinc-700 hover:shadow-xl dark:hover:shadow-zinc-900 transition-all duration-300"
    >
      <Link href={`/product/${product.slug}`} className="block relative overflow-hidden bg-[#f8f8f8] dark:bg-zinc-800 aspect-[4/3]">
        <motion.img
          animate={{ scale: hovered ? 1.05 : 1 }}
          transition={{ duration: 0.5 }}
          src={hovered && product.images[1] ? product.images[1] : product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && <span className="bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest">NEW</span>}
          {product.isBestSeller && <span className="bg-amber-500 text-black text-[10px] font-bold px-2.5 py-1 rounded-full tracking-widest">BESTSELLER</span>}
          {comparePrice && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
              {Math.round(((comparePrice - price) / comparePrice) * 100)}% OFF
            </span>
          )}
          {product.variants && product.variants.length > 0 && (
            <span className="bg-blue-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">VARIABLE</span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(id);
          }}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition backdrop-blur ${
            isWished ? "bg-red-500 text-white" : "bg-white/90 dark:bg-zinc-900/90 text-gray-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-red-500"
          }`}
        >
          <svg className="w-4 h-4" fill={isWished ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <div className="bg-black dark:bg-white text-white dark:text-black text-xs font-bold py-2.5 rounded-full text-center">VIEW DETAILS →</div>
        </div>
      </Link>

      <div className="p-4">
        <div className="flex items-center gap-2 text-[11px] tracking-widest font-bold text-gray-400 dark:text-zinc-500">
          <span className="uppercase">{product.brand}</span>
          <span className="w-1 h-1 bg-gray-300 dark:bg-zinc-600 rounded-full"></span>
          <span className="uppercase">{product.category}</span>
        </div>
        <Link href={`/product/${product.slug}`}>
          <h3 className="font-bold text-[15px] leading-tight mt-1 line-clamp-2 hover:text-amber-600 dark:hover:text-amber-500 transition text-black dark:text-white">{product.name}</h3>
        </Link>

        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex text-amber-500 text-xs">{"★★★★★".slice(0, Math.round(product.rating || 4.5))}<span className="text-gray-200 dark:text-zinc-700">{"★★★★★".slice(Math.round(product.rating || 4.5))}</span></div>
          <span className="text-xs text-gray-500 dark:text-zinc-500">({product.reviews || 0})</span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <span className="font-black text-[18px] text-black dark:text-white">{formatPrice(price)}</span>
          {comparePrice && <span className="text-sm text-gray-400 dark:text-zinc-500 line-through">{formatPrice(comparePrice)}</span>}
        </div>

        <div className="flex items-center gap-1.5 mt-2.5">
          {product.colors?.slice(0, 4).map((c: any, i: number) => (
            <span key={i} className="w-5 h-5 rounded-full border-2 border-white dark:border-zinc-800 shadow ring-1 ring-gray-200 dark:ring-zinc-700" style={{ background: c.hex }} title={c.name}></span>
          ))}
          {product.colors?.length > 4 && <span className="text-xs text-gray-500 dark:text-zinc-500">+{product.colors.length - 4}</span>}
          <span className="ml-auto text-xs text-gray-500 dark:text-zinc-500">
            {product.variants ? `${product.variants.length} variants` : `${product.sizes?.length || 0} sizes`}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
