"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import Link from "next/link";

export default function AbandonedCartPopup() {
  const [show, setShow] = useState(false);
  const [config, setConfig] = useState<any>(null);
  const items = useStore((s) => s.items);
  const count = useStore((s) => s.count());

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.abandonedCart?.enabled && data.abandonedCart?.popupEnabled) {
          setConfig(data.abandonedCart);
        }
      })
      .catch(() => {});

    // Check if cart has items and user hasn't interacted
    const hasSeen = sessionStorage.getItem("abandoned_seen");
    if (hasSeen) return;

    const delay = (config?.delayMinutes || 2) * 60 * 1000;
    const timer = setTimeout(() => {
      if (count > 0 && window.location.pathname !== "/cart" && window.location.pathname !== "/checkout") {
        setShow(true);
        sessionStorage.setItem("abandoned_seen", "1");
      }
    }, delay);

    // Also trigger on exit intent (mouse leave top)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 10 && count > 0 && !hasSeen && !show) {
        setShow(true);
        sessionStorage.setItem("abandoned_seen", "1");
      }
    };
    document.addEventListener("mouseleave", handleMouseLeave as any);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("mouseleave", handleMouseLeave as any);
    };
  }, [count, config]);

  if (!show || !config || count === 0) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 relative animate-fadeIn">
        <button onClick={() => setShow(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-black hover:text-white transition">
          ×
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-2xl">🛒</div>
          <h3 className="text-xl font-black mt-4">Wait! Don&apos;t miss out!</h3>
          <p className="text-sm text-gray-600 mt-2">{config.message || "Your cart is waiting! Complete your order now."}</p>
          {config.discountCode && (
            <div className="mt-4 bg-amber-50 border-2 border-dashed border-amber-300 rounded-2xl p-3">
              <div className="text-xs font-bold tracking-widest text-amber-700">USE CODE</div>
              <div className="font-black text-xl tracking-widest">{config.discountCode}</div>
              <div className="text-xs text-gray-600">Get {config.discountPercent || 10}% OFF on your order</div>
            </div>
          )}
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShow(false)} className="flex-1 border rounded-full py-3 font-bold hover:bg-gray-50">Continue Shopping</button>
            <Link href="/cart" onClick={() => setShow(false)} className="flex-1 bg-black text-white rounded-full py-3 font-bold text-center hover:bg-zinc-800">
              Go to Cart →
            </Link>
          </div>
          <p className="text-xs text-gray-400 mt-3">You have {count} items in your cart</p>
        </div>
      </div>
    </div>
  );
}
