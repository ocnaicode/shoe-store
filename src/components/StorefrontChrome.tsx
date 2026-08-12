"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AbandonedCartPopup from "@/components/AbandonedCartPopup";
import FlashSaleTimer from "@/components/FlashSaleTimer";
import PromotionPopup from "@/components/PromotionPopup";

/** Store-only UI must not be mounted in the back-office routes. */
export default function StorefrontChrome({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <FlashSaleTimer />
      <Navbar />
      <main className="flex-1 bg-white dark:bg-[#0a0a0a]">{children}</main>
      <WhatsAppButton />
      <AbandonedCartPopup />
      <PromotionPopup />
      <Footer />
    </>
  );
}
