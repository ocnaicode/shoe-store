"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(d=> setSiteSettings(d.siteSettings)).catch(()=>{});
  }, []);

  const contact = siteSettings?.contact || { phone: "+880 1700-000000", email: "hello@hokolifestylebd.com", address: "Gulshan-1, Dhaka, Bangladesh", hours: "10AM - 10PM (Everyday)" };
  const social = siteSettings?.social || { facebook: "#", instagram: "#", youtube: "#", tiktok: "#" };
  const footer = siteSettings?.footer || { description: "Premium footwear for every step. Crafted for comfort, designed for style. Trusted by 50,000+ customers across Bangladesh.", newsletterTitle: "GET 15% OFF YOUR FIRST ORDER", newsletterDesc: "Subscribe for new arrivals & exclusive offers", copyright: "© 2026 HOKO Lifestyle BD. All rights reserved." };
  const siteName = siteSettings?.siteName || "HOKO Lifestyle BD";

  return (
    <footer className="bg-[#fafafa] dark:bg-zinc-950 border-t border-gray-100 dark:border-zinc-900 mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        {/* Newsletter - Clean minimal */}
        <div className="py-8 lg:py-10 border-b border-gray-100 dark:border-zinc-900 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-semibold text-black dark:text-white tracking-tight">{footer.newsletterTitle}</h3>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{footer.newsletterDesc}</p>
          </div>
          <form className="flex w-full lg:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Your email address" className="flex-1 lg:w-[320px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full px-5 py-2.5 text-sm focus:outline-none focus:border-black dark:focus:border-white transition placeholder:text-gray-400" />
            <button className="bg-black dark:bg-white text-white dark:text-black font-medium px-6 py-2.5 rounded-full text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition whitespace-nowrap">Subscribe</button>
          </form>
        </div>

        {/* Links - Clean grid */}
        <div className="py-10 grid grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-sm rounded">H</div>
              <span className="font-semibold text-sm tracking-tight text-black dark:text-white">{siteName.toUpperCase()}</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed max-w-sm">
              {footer.description}
            </p>
            <div className="flex gap-2 mt-5">
              {[
                { href: social.facebook, label: "Facebook" },
                { href: social.instagram, label: "Instagram" },
                { href: social.youtube, label: "YouTube" },
                { href: social.tiktok, label: "TikTok" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" className="w-8 h-8 rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 flex items-center justify-center hover:border-black dark:hover:border-white transition text-xs font-medium text-gray-600 dark:text-zinc-400">
                  {s.label[0]}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4 text-black dark:text-white">Shop</h4>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-zinc-400">
              <li><Link href="/shop?category=sneakers" className="hover:text-black dark:text-white dark:hover:text-white transition">Sneakers</Link></li>
              <li><Link href="/shop?category=formal" className="hover:text-black dark:text-white dark:hover:text-white transition">Formal</Link></li>
              <li><Link href="/shop?category=boots" className="hover:text-black dark:text-white dark:hover:text-white transition">Boots</Link></li>
              <li><Link href="/shop?category=sports" className="hover:text-black dark:text-white dark:hover:text-white transition">Sports</Link></li>
              <li><Link href="/shop" className="hover:text-black dark:text-white dark:hover:text-white transition">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4 text-black dark:text-white">Help</h4>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-zinc-400">
              <li><Link href="/track-order" className="hover:text-black dark:text-white dark:hover:text-white transition">Track Order</Link></li>
              <li><a href="#" className="hover:text-black dark:text-white dark:hover:text-white transition">Returns</a></li>
              <li><a href="#" className="hover:text-black dark:text-white dark:hover:text-white transition">Shipping</a></li>
              <li><a href="#" className="hover:text-black dark:text-white dark:hover:text-white transition">Size Guide</a></li>
              <li><a href="#" className="hover:text-black dark:text-white dark:hover:text-white transition">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-sm mb-4 text-black dark:text-white">Contact</h4>
            <ul className="space-y-2.5 text-sm text-gray-500 dark:text-zinc-400">
              <li className="leading-relaxed">{contact.address}</li>
              <li><a href={`tel:${contact.phone.replace(/\s/g,'')}`} className="hover:text-black dark:text-white dark:hover:text-white transition">{contact.phone}</a></li>
              <li><a href={`mailto:${contact.email}`} className="hover:text-black dark:text-white dark:hover:text-white transition">{contact.email}</a></li>
              <li className="text-xs">{contact.hours}</li>
            </ul>
          </div>
        </div>

        <div className="py-6 border-t border-gray-100 dark:border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <p>{footer.copyright}</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-black dark:text-white dark:hover:text-white transition">Privacy</a>
            <span className="w-px h-3 bg-gray-200 dark:bg-zinc-800"></span>
            <a href="#" className="hover:text-black dark:text-white dark:hover:text-white transition">Terms</a>
            <div className="hidden sm:flex items-center gap-1.5 ml-2">
              <span className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-2 py-1 rounded text-[10px] font-medium text-black dark:text-white">bKash</span>
              <span className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-2 py-1 rounded text-[10px] font-medium text-black dark:text-white">Nagad</span>
              <span className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 px-2 py-1 rounded text-[10px] font-medium text-black dark:text-white">COD</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}