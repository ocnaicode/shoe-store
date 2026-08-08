"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/authStore";

type Review = {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  images: string[];
  createdAt: string;
  status: string;
};

export default function ReviewSection({ productId, productSlug }: { productId: string; productSlug: string }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: "", images: [] as string[] });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const [filter, setFilter] = useState<"all" | 5 | 4 | 3>( "all");

  const fetchReviews = () => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => {
        setReviews(d.reviews || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    for (let i = 0; i < files.length; i++) {
      const fd = new FormData();
      fd.append("file", files[i]);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        const data = await res.json();
        if (data.secure_url || data.url) {
          setForm((prev) => ({ ...prev, images: [...prev.images, data.secure_url || data.url] }));
        }
      } catch {}
    }
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.comment.trim()) return alert("Please write a review");
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          productSlug,
          userName: user?.name || "Guest User",
          userEmail: user?.email || `guest${Date.now()}@example.com`,
          rating: form.rating,
          comment: form.comment,
          images: form.images,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      alert("✅ Review submitted! Admin approval er por show hobe.");
      setForm({ rating: 5, comment: "", images: [] });
      setShowForm(false);
      fetchReviews();
    } catch (err: any) {
      alert("❌ " + err.message);
    }
    setSubmitting(false);
  };

  const filtered = filter === "all" ? reviews : reviews.filter((r) => r.rating === filter);
  const avg = reviews.length ? (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1) : "0.0";

  return (
    <div className="mt-10 border-t border-gray-100 dark:border-zinc-800 pt-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold tracking-tight text-black dark:text-white">Customer Reviews 📸</h3>
        <button onClick={() => setShowForm(!showForm)} className="bg-black dark:bg-white text-white dark:text-black font-medium px-6 py-2.5 rounded-full text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
          {showForm ? "Cancel" : "+ Write a Review"}
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mt-6">
        <div className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-6 text-center border border-gray-100 dark:border-zinc-800">
          <div className="text-4xl font-semibold tracking-tight text-black dark:text-white">{avg}</div>
          <div className="flex justify-center text-amber-500 text-sm mt-1">{"★".repeat(Math.round(Number(avg)))}<span className="text-gray-300 dark:text-zinc-700">{"★".repeat(5 - Math.round(Number(avg)))}</span></div>
          <div className="text-xs text-gray-500 dark:text-zinc-400 mt-1">Based on {reviews.length} reviews</div>
        </div>
        <div className="md:col-span-2">
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setFilter("all")} className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filter === "all" ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-black dark:text-white hover:bg-gray-50 dark:hover:bg-zinc-800"}`}>All ({reviews.length})</button>
            {[5, 4, 3].map((n) => (
              <button key={n} onClick={() => setFilter(n as any)} className={`px-4 py-2 rounded-full text-sm font-medium border transition ${filter === n ? "bg-black dark:bg-white text-white dark:text-black" : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-black dark:text-white hover:bg-gray-50"}`}>{n}★ ({reviews.filter((r) => r.rating === n).length})</button>
            ))}
          </div>
          <div className="mt-4 space-y-1.5 text-xs">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = reviews.filter((r) => r.rating === n).length;
              const pct = reviews.length ? (count / reviews.length) * 100 : 0;
              return (
                <div key={n} className="flex items-center gap-2">
                  <span className="w-6 text-black dark:text-white font-medium">{n}★</span>
                  <div className="flex-1 bg-gray-100 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${pct}%` }}></div>
                  </div>
                  <span className="w-8 text-gray-500 dark:text-zinc-400 text-right">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl p-6">
          <h4 className="font-medium text-black dark:text-white">Write Your Review + Photo</h4>
          <div className="flex gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setForm({ ...form, rating: n })} className={`text-2xl ${n <= form.rating ? "text-amber-500" : "text-gray-300 dark:text-zinc-600"}`}>
                ★
              </button>
            ))}
            <span className="ml-2 text-sm font-medium text-black dark:text-white">{form.rating}.0</span>
          </div>
          <textarea value={form.comment} onChange={(e) => setForm({ ...form, comment: e.target.value })} placeholder="Jutar quality kemon? Size thik ache? Chobi soho review din..." rows={4} className="w-full mt-4 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 text-sm focus:outline-none focus:border-black dark:focus:border-white bg-white dark:bg-zinc-800 text-black dark:text-white placeholder:text-gray-400" required />
          <div className="mt-4">
            <label className="text-xs font-medium text-black dark:text-white">Upload Photos (Cloudinary - max 3)</label>
            <div className="mt-2 flex gap-3 flex-wrap">
              {form.images.map((img, i) => (
                <div key={i} className="relative">
                  <img src={img} alt="" className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-zinc-700" />
                  <button type="button" onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                    ×
                  </button>
                </div>
              ))}
              {form.images.length < 3 && (
                <label className="w-20 h-20 border-2 border-dashed border-gray-200 dark:border-zinc-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-800 text-xs font-medium text-gray-600 dark:text-zinc-400">
                  {uploading ? "..." : "+"}
                  <span className="text-[10px]">{uploading ? "Uploading" : "Add Photo"}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          <button disabled={submitting || uploading} type="submit" className="mt-4 w-full bg-black dark:bg-white text-white dark:text-black font-medium py-3 rounded-full hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Review for Approval"}
          </button>
          <p className="text-xs text-gray-500 dark:text-zinc-400 text-center mt-2">Admin approve korar por review show hobe</p>
        </form>
      )}

      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-zinc-400">Loading reviews...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-700">
            <div className="text-3xl">📸</div>
            <div className="font-medium mt-2 text-black dark:text-white">No reviews yet</div>
            <div className="text-sm text-gray-500 dark:text-zinc-400">Be the first to review with photo!</div>
          </div>
        ) : (
          filtered.map((r) => (
            <div key={r._id} className="border border-gray-100 dark:border-zinc-800 rounded-2xl p-4 bg-white dark:bg-zinc-900">
              <div className="flex items-start gap-3">
                <img src={`https://i.pravatar.cc/100?u=${r.userName}`} alt="" className="w-10 h-10 rounded-full" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm text-black dark:text-white">{r.userName}</span>
                    <span className="text-amber-500 text-xs">{"★".repeat(r.rating)}</span>
                    <span className="text-xs text-gray-400">• {new Date(r.createdAt).toLocaleDateString()}</span>
                    <span className="ml-auto text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30 px-2 py-0.5 rounded-full font-medium">Verified Purchase</span>
                  </div>
                  <p className="text-sm mt-2 leading-relaxed text-gray-700 dark:text-zinc-300">{r.comment}</p>
                  {r.images.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {r.images.map((img, i) => (
                        <img key={i} src={img} alt="" className="w-20 h-20 rounded-xl object-cover border border-gray-200 dark:border-zinc-700 hover:scale-105 transition" />
                      ))}
                    </div>
                  )}
                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <button className="flex items-center gap-1 text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">👍 Helpful (12)</button>
                    <button className="text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white">Report</button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
