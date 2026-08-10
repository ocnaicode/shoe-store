"use client";
import { useEffect, useState } from "react";

export default function FlashSaleTimer() {
  const [flash, setFlash] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.flashSale?.enabled) {
          setFlash(data.flashSale);
        }
      })
      .catch(() => {});
    fetch("/api/coupons")
      .then((r) => r.json())
      .then((data) => {
        const flashCoupon = data.coupons?.find((c: any) => c.isFlashSale && c.isActive);
        if (flashCoupon && !flash?.enabled) {
          setFlash({
            enabled: true,
            title: `⚡ FLASH SALE - ${flashCoupon.code} - ${flashCoupon.discountValue}${flashCoupon.discountType === "percent" ? "%" : "tk"} OFF!`,
            discountPercent: flashCoupon.discountValue,
            endTime: flashCoupon.flashEndTime || flashCoupon.expiry,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!flash?.endTime) return;
    const interval = setInterval(() => {
      const diff = new Date(flash.endTime).getTime() - Date.now();
      if (diff <= 0) {
        setFlash(null);
        clearInterval(interval);
        return;
      }
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ d, h, m, s });
    }, 1000);
    return () => clearInterval(interval);
  }, [flash]);

  if (!flash?.enabled) return null;

  const hasDays = timeLeft.d > 0;

  return (
    <div className="bg-gradient-to-r from-red-600 to-orange-500 text-white py-3 px-4 text-center relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px] animate-pulse"></div>
      <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
        <span className="font-black text-sm sm:text-base flex items-center gap-2">
          <span className="animate-pulse">⚡</span> {flash.title}
          <span className="hidden sm:inline bg-white text-red-600 px-2 py-0.5 rounded font-black text-xs">LIMITED TIME</span>
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold opacity-90">ENDS IN:</span>
          <div className="flex gap-1">
            {hasDays && (
              <div className="bg-black text-white rounded-lg px-2 py-1 min-w-[50px] text-center">
                <div className="font-black text-sm leading-none">{String(timeLeft.d).padStart(2, "0")}</div>
                <div className="text-[9px] leading-none opacity-60">D</div>
              </div>
            )}
            {[
              { label: "H", value: String(timeLeft.h).padStart(2, "0") },
              { label: "M", value: String(timeLeft.m).padStart(2, "0") },
              { label: "S", value: String(timeLeft.s).padStart(2, "0") },
            ].map((t) => (
              <div key={t.label} className="bg-black text-white rounded-lg px-2 py-1 min-w-[40px] text-center">
                <div className="font-black text-sm leading-none">{t.value}</div>
                <div className="text-[9px] leading-none opacity-60">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
        <a href="/shop" className="bg-white text-red-600 font-black px-5 py-1.5 rounded-full text-xs hover:bg-black hover:text-white transition hidden sm:inline-flex">
          SHOP NOW →
        </a>
      </div>
    </div>
  );
}
