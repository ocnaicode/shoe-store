"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";
import AbandonedCartPopup from "@/components/AbandonedCartPopup";
import FlashSaleTimer from "@/components/FlashSaleTimer";
import PromotionPopup from "@/components/PromotionPopup";

/** Store-only UI must not be mounted in the back-office routes. */
export default function StorefrontChrome() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;
  return <>
    <FlashSaleTimer />
    <Navbar />
    <WhatsAppButton />
    <AbandonedCartPopup />
    <PromotionPopup />
    <Footer />
  </>;
}
