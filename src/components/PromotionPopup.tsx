"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

type Promotion = {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  isActive: boolean;
  displayDelay: number;
};

export default function PromotionPopup() {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Check if already closed in this session
    const closed = sessionStorage.getItem("promo_closed");
    if (closed) return;

    fetch("/api/promotions")
      .then((r) => r.json())
      .then((data) => {
        const active = (data.promotions || []).find((p: Promotion) => p.isActive);
        if (active) {
          setPromotion(active);
          const delay = (active.displayDelay || 3) * 1000;
          setTimeout(() => setShow(true), delay);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem("promo_closed", "1");
  };

  if (!promotion || !show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 w-8 h-8 bg-black/70 hover:bg-black text-white rounded-full flex items-center justify-center z-10 backdrop-blur"
        >
          ×
        </button>

        <div className="relative">
          <img src={promotion.image} alt={promotion.title} className="w-full h-[280px] object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          <div className="absolute bottom-0 p-6 text-white">
            <h3 className="text-2xl font-black leading-tight">{promotion.title}</h3>
            {promotion.subtitle && <p className="text-sm opacity-90 mt-1">{promotion.subtitle}</p>}
          </div>
        </div>

        <div className="p-6 text-center">
          <div className="flex gap-3">
            <Link
              href={promotion.link || "/shop"}
              onClick={handleClose}
              className="flex-1 bg-black text-white font-black py-3 rounded-full hover:bg-zinc-800 transition text-center"
            >
              {promotion.buttonText || "Shop Now"} →
            </Link>
            <button onClick={handleClose} className="px-6 border-2 border-gray-200 rounded-full font-bold hover:bg-gray-50">
              Close
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-3">Don&apos;t show again for this session</p>
        </div>
      </div>
    </div>
  );
}
