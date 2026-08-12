"use client";
import { useState } from "react";
import Link from "next/link";

export default function ChangePasswordPage() {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
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
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMessage("✅ " + data.message);
      setForm({ ...form, currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: unknown) {
      setMessage("❌ " + (err instanceof Error ? err.message : "Unable to update password"));
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#fbfbfb] dark:bg-zinc-950 px-4 py-12">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl p-8 border">
        <h1 className="text-2xl font-black text-center">Set / Change Password</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 text-center mt-1">You must be signed in and confirm your current password.</p>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <label>
            <span className="text-xs font-bold">Current Password</span>
            <input type="password" required value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} placeholder="Your current password" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
          </label>
          <label>
            <span className="text-xs font-bold">New Password</span>
            <input type="password" required value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} placeholder="At least 8 characters" className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
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
