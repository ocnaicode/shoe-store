"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/authStore";

export default function ChangePasswordPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const [form, setForm] = useState({ email: user?.email || "", currentPassword: "", newPassword: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirm) return setMessage("❌ Passwords do not match");
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          currentPassword: form.currentPassword || undefined,
          newPassword: form.newPassword,
          token: !form.currentPassword && token ? token : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("✅ " + data.message);
      setForm({ ...form, currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      setMessage("❌ " + err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#fbfbfb] dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border">
        <h1 className="text-2xl font-black text-center">Set / Change Password</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mt-1">Checkout e auto-create account er password ekhane set korun</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <label>
            <span className="text-xs font-bold">Email</span>
            <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          {user && (
            <label>
              <span className="text-xs font-bold">Current Password (if you have one)</span>
              <input type="password" value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} placeholder="Leave blank if auto-created account" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
            </label>
          )}
          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs">
              🔒 Checkout e jei email diyechen seta diye account auto-create hoyeche. Current password charai new password set korte parben (logged in thakle token diye verify hobe).
            </div>
          )}
          <label>
            <span className="text-xs font-bold">New Password</span>
            <input type="password" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="Min 6 characters" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          <label>
            <span className="text-xs font-bold">Confirm New Password</span>
            <input type="password" required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} placeholder="Confirm" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          {message && <div className={`p-3 rounded-xl text-sm ${message.startsWith("✅") ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>{message}</div>}
          <button disabled={loading} type="submit" className="w-full bg-black text-white font-black py-3 rounded-full hover:bg-zinc-800 disabled:opacity-50">
            {loading ? "Updating..." : "UPDATE PASSWORD"}
          </button>
        </form>

        <p className="text-center text-sm mt-6">
          <Link href="/auth/login" className="font-bold underline">Back to Login</Link> • <Link href="/dashboard" className="font-bold underline">Dashboard</Link>
        </p>
      </div>
    </div>
  );
}
