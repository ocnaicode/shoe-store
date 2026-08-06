"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
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
      setAuth(data.user, data.token);
      localStorage.setItem("hoko_token", data.token);
      alert("✅ Login successful!");
      router.push("/dashboard");
    } catch (err: any) {
      alert("❌ " + err.message);
    }
    setLoading(false);
  };

  const handleSocial = async (provider: string) => {
    // Mock social login - in production, redirect to OAuth
    const mockEmail = provider === "google" ? `googleuser${Date.now()}@gmail.com` : `fbuser${Date.now()}@facebook.com`;
    const mockName = provider === "google" ? "Google User" : "Facebook User";
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: mockEmail, name: mockName, provider, providerId: Date.now().toString(), avatar: `https://i.pravatar.cc/100?u=${mockEmail}` }),
      });
      const data = await res.json();
      setAuth(data.user, data.token);
      localStorage.setItem("hoko_token", data.token);
      alert(`✅ ${provider} login successful! (Mock - connect real OAuth in production)`);
      router.push("/dashboard");
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#fbfbfb] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 border shadow-sm">
        <div className="text-center">
          <h1 className="text-2xl font-black">Welcome Back!</h1>
          <p className="text-sm text-gray-500 mt-1">Login to your HOKO account</p>
        </div>

        {socialConfig?.enabled !== false && (socialConfig?.googleEnabled || socialConfig?.facebookEnabled) && (
          <div className="mt-6 space-y-3">
            {socialConfig?.googleEnabled && (
              <button onClick={() => handleSocial("google")} className="w-full border-2 border-gray-200 rounded-full py-3 flex items-center justify-center gap-2 font-bold hover:bg-gray-50 transition">
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="" className="w-5 h-5" /> Continue with Google
              </button>
            )}
            {socialConfig?.facebookEnabled && (
              <button onClick={() => handleSocial("facebook")} className="w-full bg-[#1877F2] text-white rounded-full py-3 flex items-center justify-center gap-2 font-bold hover:bg-[#166fe5] transition">
                <span className="w-5 h-5 bg-white text-[#1877F2] rounded-full flex items-center justify-center text-xs font-black">f</span> Continue with Facebook
              </button>
            )}
            <div className="flex items-center gap-3">
              <span className="flex-1 h-px bg-gray-200"></span>
              <span className="text-xs text-gray-500 font-bold">OR</span>
              <span className="flex-1 h-px bg-gray-200"></span>
            </div>
          </div>
        )}

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

        <div className="mt-6 bg-gray-50 rounded-xl p-3 text-xs text-center">
          Demo: Try <strong>admin@hokolifestylebd.com / admin123</strong> or create new account. Social login is mock - enable/disable from Admin → Settings.
        </div>
      </div>
    </div>
  );
}
