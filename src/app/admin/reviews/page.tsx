"use client";
import { useEffect, useState } from "react";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [filter, setFilter] = useState("pending");

  const fetchReviews = () => {
    fetch(`/api/reviews?all=true${filter !== "all" ? `&status=${filter}` : ""}`)
      .then((r) => r.json())
      .then((d) => setReviews(d.reviews || []))
      .catch(() => {});
    // fallback: fetch all and filter client side
    if (filter !== "all") {
      fetch("/api/reviews?all=true")
        .then((r) => r.json())
        .then((d) => {
          const all = d.reviews || [];
          setReviews(all.filter((r: any) => r.status === filter));
        }).catch(()=>{});
    }
  };

  useEffect(() => {
    // For simplicity always fetch all and filter client
    fetch("/api/reviews?all=true")
      .then((r) => r.json())
      .then((d) => {
        const all = d.reviews || [];
        if (filter === "all") setReviews(all);
        else setReviews(all.filter((r: any) => r.status === filter));
      });
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch("/api/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setReviews((prev) => prev.map((r) => (r._id === id ? { ...r, status } : r)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Photo Reviews ⭐</h2>
        <p className="text-sm text-gray-500">Customer photo reviews - Approve korle product page e show hobe</p>
      </div>

      <div className="flex gap-2">
        {["pending", "approved", "rejected", "all"].map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2 rounded-full text-sm font-bold capitalize ${filter === f ? "bg-black text-white" : "bg-white border"}`}>
            {f} {f === "pending" ? `(${reviews.filter((r) => r.status === "pending").length})` : ""}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <div className="text-4xl">📸</div>
            <h3 className="font-bold mt-3">No {filter} reviews</h3>
            <p className="text-sm text-gray-500">Customer ra review dile ekhane show hobe. Photo soho review product page theke submit korte parbe.</p>
          </div>
        ) : (
          reviews.map((r) => (
            <div key={r._id} className="bg-white rounded-2xl p-5 border">
              <div className="flex gap-4">
                <img src={`https://i.pravatar.cc/100?u=${r.userName}`} alt="" className="w-12 h-12 rounded-full" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{r.userName}</span>
                    <span className="text-amber-500 text-sm">{"★".repeat(r.rating)}</span>
                    <span className="text-xs text-gray-500">• {r.productSlug}</span>
                    <span className={`ml-auto px-2 py-1 rounded-full text-xs font-bold uppercase ${r.status === "approved" ? "bg-green-100 text-green-700" : r.status === "pending" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}>{r.status}</span>
                  </div>
                  <p className="text-sm mt-2">{r.comment}</p>
                  {r.images?.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {r.images.map((img: string, i: number) => (
                        <img key={i} src={img} alt="" className="w-20 h-20 rounded-xl object-cover border" />
                      ))}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">{new Date(r.createdAt).toLocaleString()} • {r.userEmail}</div>
                </div>
              </div>
              <div className="flex gap-2 mt-4 border-t pt-4">
                <button onClick={() => updateStatus(r._id, "approved")} className="bg-green-600 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-green-700">✅ Approve</button>
                <button onClick={() => updateStatus(r._id, "rejected")} className="bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-red-600">❌ Reject</button>
                <button onClick={() => updateStatus(r._id, "pending")} className="border px-4 py-1.5 rounded-full text-xs font-bold hover:bg-gray-50">Pending</button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm">
        <strong>💡 How it works:</strong> Customer product page e "Write a Review" e click kore rating + comment + photo upload kore. Eta initially <code>pending</code> thake. Admin approve korle product page e public show hobe. SEO teo help korbe.
      </div>
    </div>
  );
}
