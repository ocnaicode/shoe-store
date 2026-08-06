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
    localStorage.removeItem("hoko_token");
    setShowUserMenu(false);
    router.push("/");
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/#categories", label: "Categories" },
    { href: "/track-order", label: "Track Order" },
  ];

  const announcement = siteSettings?.announcement?.enabled ? siteSettings.announcement.text : "🚚 ফ্রি ডেলিভারি ৳3000+ অর্ডারে | Free Delivery on Orders over ৳3000";
  const phone = siteSettings?.contact?.phone || "+880 1700-000000";
  const logoText = siteSettings?.logoText || "HOKO";
  const logoAccent = siteSettings?.logoAccent || "LIFESTYLE";

  return (
    <>
      <div className="bg-black dark:bg-zinc-900 text-white text-xs sm:text-sm py-2.5 px-4 text-center relative z-50">
        <p className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <span className="hidden sm:inline">🚚</span>
          <span className="truncate">{announcement}</span>
          <span className="hidden md:inline-flex ml-4 items-center gap-2">
            <span className="w-px h-4 bg-white/20"></span>
            <a href={`tel:${phone.replace(/\s/g,'')}`} className="hover:text-amber-400 transition">{phone}</a>
          </span>
        </p>
      </div>

      <header className={`sticky top-0 z-40 bg-white dark:bg-black border-b transition-all duration-300 ${scrolled ? "shadow-lg dark:shadow-zinc-800" : "border-gray-100 dark:border-zinc-800"}`}>
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-[70px]">
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div whileHover={{ scale: 1.05, rotate: 3 }} className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-black text-xl rounded-sm transition">
                {logoText[0] || "H"}
              </motion.div>
              <div className="leading-none">
                <div className="font-black text-[20px] tracking-tight text-black dark:text-white">{logoText}<span className="text-amber-500">{logoAccent}</span></div>
                <div className="text-[10px] tracking-[0.3em] text-gray-500 dark:text-zinc-400 font-medium -mt-1">BD • SINCE 2020</div>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`text-sm font-medium relative py-2 transition ${pathname === l.href ? "text-black dark:text-white" : "text-gray-600 dark:text-zinc-400 hover:text-black dark:hover:text-white"}`}
                >
                  {l.label}
                  {pathname === l.href && <motion.span layoutId="nav-underline" className="absolute left-0 -bottom-1 w-full h-0.5 bg-amber-500" />}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-2">
              <div className="relative hidden xl:flex">
                <input
                  placeholder="Search shoes..."
                  className="w-[220px] bg-gray-100 dark:bg-zinc-800 rounded-full py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 focus:bg-white dark:focus:bg-zinc-900 border border-transparent focus:border-gray-200 dark:focus:border-zinc-700 transition text-black dark:text-white placeholder:text-gray-400"
                />
                <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <ThemeToggle />

              <div className="relative">
                {user ? (
                  <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 bg-gray-100 dark:bg-zinc-800 rounded-full pl-1 pr-3 py-1 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition">
                    <img src={user.avatar || `https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-8 h-8 rounded-full object-cover" />
                    <span className="text-sm font-bold hidden lg:inline max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/auth/login" className="hidden lg:inline-flex border border-gray-200 dark:border-zinc-700 rounded-full px-5 py-2.5 text-sm font-bold hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black hover:border-black dark:hover:border-white transition text-black dark:text-white">Login</Link>
                    <Link href="/dashboard" className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition text-black dark:text-white">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </Link>
                  </div>
                )}
                <AnimatePresence>
                {showUserMenu && user && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border dark:border-zinc-800 p-4 z-50">
                    <div className="flex items-center gap-3 pb-3 border-b dark:border-zinc-800">
                      <img src={user.avatar || `https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-12 h-12 rounded-full" />
                      <div>
                        <div className="font-bold text-sm text-black dark:text-white">{user.name}</div>
                        <div className="text-xs text-gray-500 dark:text-zinc-400 truncate max-w-[140px]">{user.email}</div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${user.role === "admin" ? "bg-amber-500 text-black" : "bg-gray-100 dark:bg-zinc-800 dark:text-white"}`}>{user.role.toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="space-y-1 mt-3">
                      <Link href="/dashboard" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm font-medium text-black dark:text-white">📦 My Orders</Link>
                      <Link href="/auth/change-password" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 text-sm font-medium text-black dark:text-white">🔑 Change Password</Link>
                      {user.role === "admin" && <Link href="/admin" onClick={() => setShowUserMenu(false)} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-bold text-sm">🛠️ Admin Panel</Link>}
                      <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 font-bold text-sm">🚪 Logout</button>
                    </div>
                  </motion.div>
                )}
                </AnimatePresence>
              </div>

              <Link href="/dashboard" className="relative w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition text-black dark:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{wishlist.length}</span>
                )}
              </Link>

              <Link href="/cart" className="relative w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{count}</span>
                )}
              </Link>

              <Link href="/admin" className="hidden lg:inline-flex ml-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-sm px-5 py-2.5 rounded-full transition">
                Admin
              </Link>
            </div>

            <div className="flex lg:hidden items-center gap-2">
              <ThemeToggle />
              {user ? (
                <Link href="/dashboard" className="w-8 h-8 rounded-full overflow-hidden"><img src={user.avatar || `https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-full h-full object-cover" /></Link>
              ) : (
                <Link href="/auth/login" className="text-xs font-bold border dark:border-zinc-700 rounded-full px-4 py-2 text-black dark:text-white">Login</Link>
              )}
              <Link href="/cart" className="relative w-10 h-10 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">{count}</span>
                )}
              </Link>
              <button onClick={() => setMobileOpen(!mobileOpen)} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="lg:hidden border-t bg-white dark:bg-black dark:border-zinc-800 overflow-hidden">
            <div className="px-4 py-4 space-y-3">
              <div className="relative">
                <input placeholder="Search shoes..." className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none focus:bg-white dark:focus:bg-zinc-900 focus:ring-2 focus:ring-black/5 border border-transparent text-black dark:text-white" />
                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {navLinks.map((l) => (
                <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className="block py-3 font-medium border-b border-gray-100 dark:border-zinc-800 last:border-0 text-black dark:text-white">
                  {l.label}
                </Link>
              ))}
              <div className="grid grid-cols-2 gap-3 pt-3">
                {user ? (
                  <>
                    <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="bg-gray-100 dark:bg-zinc-800 text-center py-3 rounded-full font-medium text-black dark:text-white">My Account</Link>
                    <button onClick={() => { handleLogout(); setMobileOpen(false); }} className="bg-red-500 text-white text-center py-3 rounded-full font-bold">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="bg-black dark:bg-white text-white dark:text-black text-center py-3 rounded-full font-bold">Login</Link>
                    <Link href="/auth/register" onClick={() => setMobileOpen(false)} className="bg-gray-100 dark:bg-zinc-800 text-center py-3 rounded-full font-medium text-black dark:text-white">Register</Link>
                  </>
                )}
              </div>
              <Link href="/admin" onClick={() => setMobileOpen(false)} className="block bg-amber-500 text-black text-center py-3 rounded-full font-bold">Admin Panel</Link>
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </header>
    </>
  );
}
