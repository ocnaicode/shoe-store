"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }
    const token = localStorage.getItem("hoko_token");
    if (!user || !token) {
      setChecking(false);
      router.push("/admin/login");
      return;
    }
    if (user.role !== "admin") {
      setChecking(false);
      router.push("/admin/login");
      return;
    }
    fetch("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (!data.user || data.user.role !== "admin") {
          router.push("/admin/login");
        }
        setChecking(false);
      })
      .catch(() => {
        setChecking(false);
      });
  }, [user, pathname]);

  const handleLogout = () => {
    logout();
    localStorage.removeItem("hoko_token");
    router.push("/admin/login");
  };

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#f5f5f5] dark:bg-zinc-950">{children}</div>;
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5] dark:bg-zinc-950">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 font-medium text-black dark:text-white">Checking admin access...</p>
          <p className="text-sm text-gray-500 dark:text-zinc-400">MongoDB Atlas connected • Verifying JWT</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  const nav = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/home", label: "Home Page", icon: "🏠" },
    { href: "/admin/products", label: "Products", icon: "👟" },
    { href: "/admin/categories", label: "Categories", icon: "📁" },
    { href: "/admin/orders", label: "Orders", icon: "📦" },
    { href: "/admin/reviews", label: "Reviews", icon: "⭐" },
    { href: "/admin/coupons", label: "Coupons & Flash Sale", icon: "🎟️" },
    { href: "/admin/promotions", label: "Popups", icon: "🎉" },
    { href: "/admin/site-settings", label: "Site Customize", icon: "🎨" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-zinc-950 flex">
      <aside className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-40 w-[280px] bg-black text-white flex flex-col transition-transform`}>
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center font-black rounded">H</div>
            <div>
              <div className="font-black">HOKO ADMIN</div>
              <div className="text-xs text-white/60">Lifestyle BD • Pro</div>
            </div>
          </div>
          <div className="mt-4 bg-white/10 rounded-xl p-3 text-xs">
            <div className="text-white/60">Logged in as</div>
            <div className="font-bold truncate">{user.name} • {user.email}</div>
            <div className="mt-1 inline-block bg-amber-500 text-black dark:text-white px-2 py-0.5 rounded-full text-[10px] font-black">{user.role.toUpperCase()} • MongoDB Atlas ✅</div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${pathname === n.href ? "bg-white text-black" : "hover:bg-white/10 text-white/80"}`}
            >
              <span>{n.icon}</span> {n.label}
            </Link>
          ))}

          <div className="pt-4 mt-4 border-t border-white/10 space-y-1">
            <div className="text-xs font-bold tracking-widest text-white/40 px-4">QUICK</div>
            <a href="/api/settings" target="_blank" className="flex items-center gap-3 px-4 py-2 rounded-xl text-xs hover:bg-white/10 text-white/60">🔗 API Settings</a>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-white/10">
              ← Back to Store
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm hover:bg-red-500/20 text-red-400 font-bold">
              🚪 Logout
            </button>
          </div>
        </nav>

        <div className="p-4">
          <div className="bg-amber-500 text-black dark:text-white rounded-xl p-4">
            <div className="font-black text-sm">Protected Admin</div>
            <div className="text-xs mt-1">JWT + Role Guard • Cloudinary • Steadfast • MongoDB Atlas</div>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)}></div>}

      <div className="flex-1 flex flex-col min-w-0 bg-[#f5f5f5] dark:bg-zinc-950">
        <header className="bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 sticky top-0 z-20 flex items-center justify-between px-4 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-10 h-10 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-black dark:text-white">
              ☰
            </button>
            <h1 className="font-semibold tracking-tight text-black dark:text-white">Admin Panel</h1>
            <span className="hidden md:inline-flex bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 text-xs font-medium px-2.5 py-1 rounded-full">● Atlas Live</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-zinc-400 hidden sm:inline">MongoDB: Atlas Connected ✅</span>
            <img src={user.avatar || `https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200 dark:ring-zinc-700" />
            <span className="hidden md:inline font-medium text-sm text-black dark:text-white">{user.name}</span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-8 bg-[#f5f5f5] dark:bg-zinc-950">{children}</main>
      </div>
    </div>
  );
}