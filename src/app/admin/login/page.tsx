"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import Link from "next/link";

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setAuth = useAuthStore((s) => s.setAuth);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  useEffect(() => { if (user?.role === "admin") router.replace("/admin"); }, [user, router]);
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Login failed");
      if (data.user.role !== "admin") throw new Error("This account does not have admin access.");
      setAuth(data.user, "");
      router.replace("/admin");
    } catch (err) { setError(err instanceof Error ? err.message : "Login failed"); }
    finally { setLoading(false); }
  };
  return <div className="min-h-[80vh] flex items-center justify-center bg-[#f5f5f5] dark:bg-zinc-950 px-4"><div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border shadow-xl"><div className="text-center"><div className="w-16 h-16 bg-black text-white rounded-2xl flex items-center justify-center mx-auto font-black text-2xl">H</div><h1 className="text-2xl font-black mt-4">Admin Login</h1><p className="text-sm text-gray-500 mt-1">Use an administrator account to continue.</p></div><form onSubmit={handleLogin} className="space-y-4 mt-8"><label><span className="text-xs font-bold">Admin Email</span><input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="admin@yourstore.com" className="w-full mt-1 border-2 rounded-xl px-4 py-3 text-sm focus:border-black outline-none" /></label><label><span className="text-xs font-bold">Password</span><input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full mt-1 border-2 rounded-xl px-4 py-3 text-sm focus:border-black outline-none" /></label>{error && <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm">{error}</div>}<button disabled={loading} type="submit" className="w-full bg-black text-white font-black py-3 rounded-full disabled:opacity-50">{loading ? "Checking..." : "Login to Admin Panel"}</button></form><div className="mt-4 text-center"><Link href="/" className="text-sm font-bold underline">← Back to Store</Link></div></div></div>;
}
