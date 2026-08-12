"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return alert("Passwords do not match");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, password: form.password, phone: form.phone }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setAuth(data.user, "");
      alert("✅ Account created successfully!");
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
          <h1 className="text-2xl font-black">Create Account</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Join HOKO Lifestyle BD</p>
        </div>


        <form onSubmit={handleRegister} className="space-y-4 mt-6">
          <label>
            <span className="text-xs font-bold">Full Name</span>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-black/10 outline-none" />
          </label>
          <label>
            <span className="text-xs font-bold">Email</span>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="text-xs font-bold">Phone (optional)</span>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="text-xs font-bold">Password</span>
            <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm outline-none" />
          </label>
          <label>
            <span className="text-xs font-bold">Confirm Password</span>
            <input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm password" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm outline-none" />
          </label>
          <button disabled={loading} type="submit" className="w-full bg-black text-white font-black py-3 rounded-full hover:bg-zinc-800 transition disabled:opacity-50">
            {loading ? "Creating..." : "CREATE ACCOUNT"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          Already have account? <Link href="/auth/login" className="font-black underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
