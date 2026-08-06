"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import Link from "next/link";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "admin@hokolifestylebd.com", password: "admin123" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "admin") router.push("/admin");
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // Try to create admin if not exists (seed)
      // First try login
      let res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      let data = await res.json();
      
      // If user not found and it's the default admin, auto-create
      if (!res.ok && form.email === "admin@hokolifestylebd.com" && form.password === "admin123") {
        // Try to register admin
        const regRes = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: "Admin", email: form.email, password: form.password, phone: "01700000000" }),
        });
        const regData = await regRes.json();
        if (regRes.ok) {
          // Update role to admin via direct DB (mock) - for fallback we need to patch user
          // For MongoDB, we need to update role manually via API or direct
          // We'll call a special endpoint to promote to admin
          await fetch("/api/auth/promote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, role: "admin", secret: "hoko_admin_secret" }),
          }).catch(()=>{});
          // Retry login
          res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password }),
          });
          data = await res.json();
        } else if (regData.error?.includes("already exists")) {
          // Try promote existing to admin
          await fetch("/api/auth/promote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, role: "admin", secret: "hoko_admin_secret" }),
          }).catch(()=>{});
          res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password }),
          });
          data = await res.json();
        }
      }

      if (!res.ok) throw new Error(data.error || "Login failed");

      // Check role - if not admin, promote if it's the default admin email
      if (data.user.role !== "admin") {
        if (form.email === "admin@hokolifestylebd.com") {
          await fetch("/api/auth/promote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, role: "admin", secret: "hoko_admin_secret" }),
          });
          // Re-login to get updated role
          const retry = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: form.email, password: form.password }),
          });
          const retryData = await retry.json();
          if (retryData.user.role === "admin") data = retryData;
          else throw new Error("Access denied: Not an admin account");
        } else {
          throw new Error("Access denied: Not an admin account. Only admin can access this panel.");
        }
      }

      setAuth(data.user, data.token);
      localStorage.setItem("hoko_token", data.token);
      router.push("/admin");
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#f5f5f5] px-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border shadow-xl">
        <div className="text-center">
          <div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto font-black text-2xl">H</div>
          <h1 className="text-2xl font-black mt-4">Admin Login</h1>
          <p className="text-sm text-gray-500 mt-1">HOKO Lifestyle BD - Admin Panel Only</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mt-8">
          <label>
            <span className="text-xs font-bold">Admin Email</span>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 border-2 rounded-xl px-4 py-3 text-sm focus:border-black outline-none" />
          </label>
          <label>
            <span className="text-xs font-bold">Password</span>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full mt-1 border-2 rounded-xl px-4 py-3 text-sm focus:border-black outline-none" />
          </label>

          {error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">{error}</div>}

          <button disabled={loading} type="submit" className="w-full bg-black text-white font-black py-3 rounded-full hover:bg-zinc-800 disabled:opacity-50">
            {loading ? "Checking..." : "🔐 Login to Admin Panel"}
          </button>
        </form>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
          <div className="font-bold">🔑 Default Admin Credentials:</div>
          <div className="font-mono mt-1">admin@hokolifestylebd.com / admin123</div>
          <div className="text-gray-600 mt-2">First time login e auto-create hobe & admin role paabe. MongoDB connect ache, tai data persist hobe.</div>
        </div>

        <div className="mt-4 text-center">
          <Link href="/" className="text-sm font-bold underline">← Back to Store</Link>
        </div>

        <div className="mt-6 text-xs text-center text-gray-400">
          Protected by JWT + Role-based Access • MongoDB Atlas Connected<br />
          Steadfast & Cloudinary configured from Settings
        </div>
      </div>
    </div>
  );
}
