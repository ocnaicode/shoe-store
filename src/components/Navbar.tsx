"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { usePathname, useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [siteSettings, setSiteSettings] = useState<any>(null);
  const count = useStore((s) => s.count());
  const wishlist = useStore((s) => s.wishlist);
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/settings").then(r=>r.json()).then(d=> setSiteSettings(d.siteSettings)).catch(()=>{});
  }, []);

  const handleLogout = () => {
    logout();
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    setShowUserMenu(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/#categories", label: "Categories" },
    { href: "/track-order", label: "Track Order" },
  ];
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearch, setMobileSearch] = useState("");

  const handleSearch = (query: string) => {
    const q = query.trim();
    if (q) {
      router.push(`/shop?search=${encodeURIComponent(q)}`);
      setSearchQuery("");
      setMobileSearch("");
      setMobileOpen(false);
    }
  };

  const announcement = siteSettings?.announcement?.enabled ? siteSettings.announcement.text : "Free Delivery on Orders over ৳3000";
  const phone = siteSettings?.contact?.phone || "+880 1700-000000";
  const logoText = siteSettings?.logoText || "HOKO";
  const logoAccent = siteSettings?.logoAccent || "LIFESTYLE";

  return (
    <>
      <div className="bg-[#0a0a0a] dark:bg-zinc-950 text-white text-xs py-2 px-4 text-center">
        <p className="max-w-[1400px] mx-auto flex items-center justify-center gap-2 tracking-wide">
          <span className="opacity-80">{announcement}</span>
          <span className="hidden md:inline-flex items-center gap-2 ml-4">
            <span className="w-px h-3 bg-white/20"></span>
            <a href={`tel:${phone.replace(/\s/g,'')}`} className="hover:text-amber-400 transition font-medium">{phone}</a>
          </span>
        </p>
      </div>

      <header className={`sticky top-0 z-40 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b transition-all ${scrolled ? "shadow-sm dark:shadow-zinc-900 border-gray-200 dark:border-zinc-800" : "border-gray-100 dark:border-zinc-800/50"}`}>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[68px]">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-lg rounded-md">
                {logoText[0] || "H"}
              </div>
              <div className="leading-none hidden sm:block">
                <div className="font-black text-[18px] tracking-tight text-black dark:text-white">{logoText}<span className="font-normal text-gray-500 dark:text-zinc-500">{logoAccent}</span></div>
                <div className="text-[10px] tracking-[0.2em] text-gray-400 font-medium">SINCE 2020</div>
              </div>
              <div className="leading-none sm:hidden">
                <div className="font-black text-[16px] text-black dark:text-white">{logoText}</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-7">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-[13px] font-medium tracking-wide transition ${pathname === l.href ? "text-black dark:text-white" : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"}`}
                >
                  {l.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-1.5">
              <div className="relative hidden xl:flex mr-2">
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(searchQuery)}
                  placeholder="Search..."
                  className="w-[200px] bg-gray-50 dark:bg-zinc-900 rounded-full py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-black/10 dark:focus:ring-white/10 focus:bg-white dark:focus:bg-black border border-gray-200 dark:border-zinc-800 transition placeholder:text-gray-400"
                />
                <button onClick={() => handleSearch(searchQuery)} className="absolute left-3 top-1/2 -translate-y-1/2">
                  <svg className="w-4 h-4 text-gray-400 hover:text-black dark:hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>

              <ThemeToggle />

              <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800 mx-1 hidden lg:block"></div>

              <div className="relative">
                {user ? (
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 hover:opacity-80 transition">
                    <img src={user.avatar || `https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-8 h-8 rounded-full object-cover ring-1 ring-gray-200 dark:ring-zinc-700" />
                    <span className="text-sm font-medium hidden lg:inline max-w-[90px] truncate text-black dark:text-white">{user.name.split(" ")[0]}</span>
                  </button>
                ) : (
                  <Link href="/auth/login" className="hidden lg:inline-flex text-sm font-medium px-4 py-2 hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-full transition text-black dark:text-white">Login</Link>
                )}
                <AnimatePresence>
                {showUserMenu && user && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute right-0 top-full mt-3 w-64 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-100 dark:border-zinc-800 p-3 z-50">
                    <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-zinc-800">
                      <img src={user.avatar || `https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-10 h-10 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate text-black dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>
                    <div className="space-y-0.5 mt-3">
                      <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm text-black dark:text-white">My Orders</Link>
                      <Link href="/auth/change-password" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 text-sm text-black dark:text-white">Change Password</Link>
                      {user.role === "admin" && <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-medium">Admin Panel</Link>}
                      <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 text-sm">Logout</button>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              <Link href="/dashboard" className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-full transition relative text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                {wishlist.length > 0 && <span className="absolute -top-1 -right-1 bg-black dark:bg-white text-white dark:text-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>}
              </Link>

              <Link href="/cart" className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-zinc-900 rounded-full transition relative text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {count > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{count}</span>}
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-1">
              <ThemeToggle />
              <Link href="/cart" className="relative w-9 h-9 flex items-center justify-center text-black dark:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                {count > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{count}</span>}
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="w-9 h-9 flex items-center justify-center text-black dark:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} /></svg>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden">
            <div className="px-4 py-5 space-y-1">
              <div className="relative mb-4">
                <input
                  value={mobileSearch}
                  onChange={(e) => setMobileSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(mobileSearch)}
                  placeholder="Search shoes..."
                  className="w-full bg-gray-50 dark:bg-zinc-900 rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none border border-transparent focus:border-gray-200 dark:focus:border-zinc-700 text-black dark:text-white"
                />
                <button onClick={() => handleSearch(mobileSearch)} className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg className="w-5 h-5 text-gray-400 hover:text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className={`block py-3 text-sm font-medium border-b border-gray-50 dark:border-zinc-900 last:border-0 ${pathname === l.href ? "text-black dark:text-white" : "text-gray-600 dark:text-zinc-400"}`}>
                  {l.label}
                </Link>
              ))}
              <div className="pt-4 flex gap-3">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex-1 bg-gray-900 dark:bg-white text-white dark:text-black text-center py-3 rounded-full text-sm font-medium">My Account</Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="flex-1 border border-gray-200 dark:border-zinc-700 text-center py-3 rounded-full text-sm font-medium text-black dark:text-white">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="flex-1 bg-black dark:bg-white text-white dark:text-black text-center py-3 rounded-full text-sm font-medium">Login</Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="flex-1 border border-gray-200 dark:border-zinc-700 text-center py-3 rounded-full text-sm font-medium text-black dark:text-white">Register</Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </header>
    </>
  );
}
