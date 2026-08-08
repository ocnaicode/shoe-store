"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [socialConfig, setSocialConfig] = useState<any>(null);
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSocialConfig(d.socialLogin))
      .catch(() => {});
  }, []);

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
      setAuth(data.user, data.token);
      localStorage.setItem("hoko_token", data.token);
      alert("✅ Account created successfully!");
      router.push("/dashboard");
    } catch (err: any) {
      alert("❌ " + err.message);
    }
    setLoading(false);
  };

  const handleSocial = async (provider: string) => {
    const mockEmail = provider === "google" ? `googleuser${Date.now()}@gmail.com` : `fbuser${Date.now()}@facebook.com`;
    const mockName = provider === "google" ? "Google User" : "Facebook User";
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockEmail, name: mockName, provider, providerId: Date.now().toString() }),
      });
      const data = await res.json();
      setAuth(data.user, data.token);
      localStorage.setItem("hoko_token", data.token);
      router.push("/dashboard");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#fbfbfb] dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-black">Create Account</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Join HOKO Lifestyle BD</p>
        </div>

        {socialConfig?.enabled !== false && (socialConfig?.googleEnabled || socialConfig?.facebookEnabled) && (
          <div className="mt-6 space-y-3">
            {socialConfig?.googleEnabled && (
              <button onClick={() => handleSocial("google")} className="w-full border-2 border-gray-200 dark:border-zinc-700 rounded-full py-3 flex items-center justify-center gap-2 font-bold hover:bg-gray-50 dark:bg-zinc-800 transition">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-5 h-5" /> Continue with Google
              </button>
            )}
            {socialConfig?.facebookEnabled && (
              <button onClick={() => handleSocial("facebook")} className="w-full bg-[#1877F2] text-white rounded-full py-3 flex items-center justify-center gap-2 font-bold">
                <span className="w-5 h-5 bg-white dark:bg-zinc-900 text-[#1877F2] rounded-full flex items-center justify-center text-xs font-black">f</span> Continue with Facebook
              </button>
            )}
            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-gray-200"></span>
              <span className="text-xs text-gray-500 dark:text-zinc-400 font-bold">OR</span>
              <span className="flex-1 h-px bg-gray-200"></span>
            </div>
          </div>
        )}

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
