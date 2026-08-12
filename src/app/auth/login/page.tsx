"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      setAuth(data.user, "");
      alert("✅ Login successful!");
      router.push("/dashboard");
    } catch (err: unknown) {
      alert("❌ " + (err instanceof Error ? err.message : "Something went wrong"));
    }
    setLoading(false);
  };


  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#fbfbfb] dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-black">Welcome Back!</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Login to your HOKO account</p>
        </div>


        <form onSubmit={handleLogin} className="space-y-4 mt-6">
          <label>
            <span className="text-xs font-bold">Email</span>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none" />
          </label>
          <label>
            <span className="text-xs font-bold">Password</span>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none" />
          </label>
          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Remember me
            </label>
            <Link href="/auth/change-password" className="font-bold underline">Forgot password?</Link>
          </div>
          <button disabled={loading} type="submit" className="w-full bg-black text-white font-black py-3 rounded-full hover:bg-zinc-800 transition disabled:opacity-50">
            {loading ? "Logging in..." : "LOGIN"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Don&apos;t have an account? <Link href="/auth/register" className="font-black underline">Create Account</Link>
        </p>

      </div>
    </div>
  );
}
