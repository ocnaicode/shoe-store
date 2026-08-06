"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Footer() {
  const [siteSettings, setSiteSettings] = useState<any>(null);

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(d=> setSiteSettings(d.siteSettings)).catch(()=>{});
  }, []);

  const contact = siteSettings?.contact || { phone: "+880 1700-000000", email: "hello@hokolifestylebd.com", address: "Gulshan-1, Dhaka, Bangladesh", hours: "10AM - 10PM (Everyday)" };
  const social = siteSettings?.social || { facebook: "#", instagram: "#", youtube: "#", tiktok: "#" };
  const footer = siteSettings?.footer || { description: "বাংলাদেশের সবচেয়ে বিশ্বস্ত জুতার দোকান। Premium sneakers, formal, boots & sports shoes at best price. Cash on delivery available nationwide.", newsletterTitle: "GET 15% OFF YOUR FIRST ORDER", newsletterDesc: "Subscribe and get exclusive deals & early access to new collections", copyright: "© 2026 HOKO Lifestyle BD. All rights reserved. Made with ❤️ in Bangladesh." };
  const siteName = siteSettings?.siteName || "HOKO Lifestyle BD";

  return (
    <footer className="bg-[#0a0a0a] dark:bg-black text-white mt-auto">
      <div className="border-b border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h3 className="text-2xl font-black">{footer.newsletterTitle}</h3>
            <p className="text-white/60 text-sm mt-1">{footer.newsletterDesc}</p>
          </motion.div>
          <motion.form initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex w-full lg:w-auto gap-2" onSubmit={(e) => e.preventDefault()}>
            <input placeholder="Enter your email" className="flex-1 lg:w-[360px] bg-white dark:bg-zinc-900 text-black dark:text-white rounded-full px-6 py-3.5 text-sm focus:outline-none border-0" />
            <button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-8 py-3.5 rounded-full text-sm whitespace-nowrap transition hover:scale-105">SUBSCRIBE</button>
          </motion.form>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white text-black flex items-center justify-center font-black text-xl rounded-sm">H</div>
              <div>
                <div className="font-black text-lg leading-none">{siteName.toUpperCase()}</div>
                <div className="text-[10px] tracking-widest text-white/50">PREMIUM SHOE STORE</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed max-w-sm">
              {footer.description}
            </p>
            <div className="flex gap-3 mt-6">
              {[
                { href: social.facebook, label: "fb" },
                { href: social.instagram, label: "ig" },
                { href: social.youtube, label: "yt" },
                { href: social.tiktok, label: "tk" },
              ].map((s) => (
                <a key={s.label} href={s.href} target="_blank" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-amber-500 hover:text-black transition text-sm font-bold uppercase">
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-bold text-sm tracking-widest mb-4">SHOP</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="/shop?category=sneakers" className="hover:text-white hover:translate-x-1 inline-block transition">Sneakers</Link></li>
              <li><Link href="/shop?category=formal" className="hover:text-white hover:translate-x-1 inline-block transition">Formal Shoes</Link></li>
              <li><Link href="/shop?category=boots" className="hover:text-white hover:translate-x-1 inline-block transition">Boots</Link></li>
              <li><Link href="/shop?category=sports" className="hover:text-white hover:translate-x-1 inline-block transition">Sports</Link></li>
              <li><Link href="/shop" className="hover:text-white hover:translate-x-1 inline-block transition">New Arrivals</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm tracking-widest mb-4">HELP</h4>
            <ul className="space-y-2.5 text-sm text-white/60">
              <li><Link href="/track-order" className="hover:text-white">Track Order</Link></li>
              <li><a href="#" className="hover:text-white">Returns & Exchange</a></li>
              <li><a href="#" className="hover:text-white">Shipping Policy</a></li>
              <li><a href="#" className="hover:text-white">Size Guide</a></li>
              <li><a href="#" className="hover:text-white">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm tracking-widest mb-4">CONTACT</h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex gap-2"><span>📍</span> <span className="line-clamp-2">{contact.address}</span></li>
              <li className="flex gap-2"><span>📞</span> <a href={`tel:${contact.phone.replace(/\s/g,'')}`} className="hover:text-white">{contact.phone}</a></li>
              <li className="flex gap-2"><span>✉️</span> <a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a></li>
              <li className="flex gap-2"><span>🕒</span> {contact.hours}</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/40">
          <p>{footer.copyright}</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms of Service</a>
            <div className="flex items-center gap-2">
              <span>Pay with:</span>
              <div className="flex gap-1.5">
                <span className="bg-white text-black px-2 py-1 rounded text-[10px] font-black">bKash</span>
                <span className="bg-white text-black px-2 py-1 rounded text-[10px] font-black">Nagad</span>
                <span className="bg-white text-black px-2 py-1 rounded text-[10px] font-black">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ShoeStore",
            name: siteName,
            url: "https://hokolifestylebd.com",
            logo: "https://hokolifestylebd.com/logo.png",
            description: footer.description,
            address: { "@type": "PostalAddress", addressLocality: "Dhaka", addressCountry: "BD" },
            telephone: contact.phone,
          }),
        }}
      />
    </footer>
  );
}
