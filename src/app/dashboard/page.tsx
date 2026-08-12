"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useAuthStore } from "@/lib/authStore";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [tab, setTab] = useState<"orders" | "wishlist" | "profile" | "addresses">("orders");
  const wishlist = useStore((s) => s.wishlist);
  const toggleWishlist = useStore((s) => s.toggleWishlist);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "", phone: user?.phone || "" });

  useEffect(() => {
    if (user) setProfileForm({ name: user.name, email: user.email, phone: user.phone || "" });
  }, [user]);

  useEffect(() => {
    const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
    // Filter by user email if logged in
    const filtered = user ? local.filter((o: any) => o.customer?.email === user.email || !o.customer?.email) : local;
    setOrders(local);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((d) => {
        if (d.orders && d.orders.length) {
          // If MongoDB, filter by user if needed
          setOrders(d.orders);
        }
      })
      .catch(() => {});
  }, [user]);

  const handleLogout = () => {
    logout();
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/auth/login");
  };

  if (!user) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-16 text-center">
        <div className="w-20 h-20 bg-gray-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-2xl">🔒</div>
        <h1 className="text-2xl font-black mt-4">Please Login</h1>
        <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">Login to view your orders, invoices and profile. Checkout e auto account create hobe.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link href="/auth/login" className="bg-black text-white px-8 py-3 rounded-full font-bold">Login</Link>
          <Link href="/auth/register" className="border-2 border-black px-8 py-3 rounded-full font-bold">Create Account</Link>
        </div>
        <div className="mt-8 bg-white dark:bg-zinc-900 rounded-2xl p-6 border max-w-md mx-auto text-left">
          <h3 className="font-black">Recent Orders (Guest)</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Login korle shudhu apnar order dekhabe. Ekhon guest hisabe {orders.length} ta order ache.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#fbfbfb] dark:bg-zinc-950 min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black">MY ACCOUNT</h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Welcome back, {user.name}! • {user.email}</p>
          </div>
          <button onClick={handleLogout} className="hidden md:inline-flex border-2 border-red-200 text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-50">Logout</button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mt-8">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border h-fit sticky top-[90px]">
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-zinc-800 rounded-xl">
              <img src={user.avatar || `https://i.pravatar.cc/100?u=${user.email}`} alt="" className="w-12 h-12 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-sm truncate">{user.name}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400 truncate">{user.email}</div>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">{user.role.toUpperCase()}</span>
              </div>
            </div>
            <nav className="mt-4 space-y-1">
              {[
                { id: "orders", label: "My Orders", icon: "📦", count: orders.length },
                { id: "wishlist", label: "Wishlist", icon: "❤️", count: wishlist.length },
                { id: "addresses", label: "Addresses", icon: "📍" },
                { id: "profile", label: "Profile Settings", icon: "⚙️" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-left ${tab === item.id ? "bg-black dark:bg-white dark:bg-zinc-900 text-white dark:text-black dark:text-white" : "hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-600 dark:text-zinc-400"}`}
                >
                  <span>{item.icon}</span> {item.label}
                  {item.count !== undefined && <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${tab === item.id ? "bg-white dark:bg-black text-black dark:text-white" : "bg-gray-100 dark:bg-zinc-800"}`}>{item.count}</span>}
                </button>
              ))}
              <Link href="/auth/change-password" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-800 border border-gray-200 dark:border-zinc-700 mt-3 text-black dark:text-white">
                Change Password
              </Link>
              {user.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-black dark:bg-white dark:bg-zinc-900 text-white dark:text-black dark:text-white mt-2">
                  Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 border border-red-100 dark:border-red-900/30 mt-2">
                Logout
              </button>
            </nav>
          </div>

          <div className="lg:col-span-3">
            {tab === "orders" && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border flex items-center justify-between">
                  <h2 className="font-black">ORDER HISTORY • Invoices</h2>
                  <Link href="/track-order" className="text-sm font-bold underline">Track Order</Link>
                </div>

                {orders.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 rounded-2xl p-12 border text-center">
                    <div className="text-5xl">📦</div>
                    <h3 className="font-bold mt-3">No orders yet</h3>
                    <p className="text-sm text-gray-500 dark:text-zinc-400">You haven&apos;t placed any orders.</p>
                    <Link href="/shop" className="inline-flex mt-4 bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold">Start Shopping</Link>
                  </div>
                ) : (
                  orders.map((o) => (
                    <div key={o.id || o.orderId} className="bg-white dark:bg-zinc-900 rounded-2xl p-5 border">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-black">{o.id || o.orderId}</div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400">{new Date(o.createdAt).toLocaleString()} • {o.paymentMethod?.toUpperCase()}</div>
                          {o.customer?.email === user.email && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">Your Order ✅</span>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${o.status === "delivered" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{o.status}</span>
                      </div>
                      <div className="flex gap-2 mt-4 overflow-auto">
                        {(o.items || []).map((it: any, i: number) => (
                          <img key={i} src={it.image} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-50 dark:bg-zinc-800 border" />
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-4 border-t pt-4">
                        <div className="font-black">{formatPrice(o.total)}</div>
                        <div className="flex gap-2 flex-wrap">
                          <Link href={`/invoice/${o.id || o.orderId}`} className="bg-black text-white px-4 py-2 rounded-full text-xs font-bold hover:bg-zinc-800 flex items-center gap-1">
                            📄 Invoice
                          </Link>
                          <Link href={`/track-order?orderId=${o.id || o.orderId}`} className="border px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-50 dark:bg-zinc-800">
                            Track
                          </Link>
                          <a href={`/api/invoice?orderId=${o.id || o.orderId}`} target="_blank" className="border px-4 py-2 rounded-full text-xs font-bold hover:bg-gray-50 dark:bg-zinc-800 hidden sm:inline-flex">
                            Email
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === "wishlist" && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
                <h2 className="font-black">MY WISHLIST</h2>
                {wishlist.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-4">No items in wishlist.</p>
                ) : (
                  <div className="space-y-3 mt-4">
                    {wishlist.map((id) => (
                      <div key={id} className="flex items-center gap-4 border rounded-xl p-3">
                        <div className="flex-1 text-sm font-medium">Product ID: {id}</div>
                        <button onClick={() => toggleWishlist(id)} className="text-xs font-bold text-red-600 border border-red-200 px-3 py-1 rounded-full">
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "addresses" && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
                <h2 className="font-black">SAVED ADDRESSES</h2>
                <div className="border-2 border-dashed rounded-xl p-6 text-center mt-4">
                  <p className="text-sm text-gray-500 dark:text-zinc-400">You have no saved addresses.</p>
                  <button className="mt-3 bg-black text-white px-6 py-2 rounded-full text-sm font-bold">Add New Address</button>
                </div>
                <div className="mt-4 border rounded-xl p-4">
                  <div className="font-bold text-sm">Home</div>
                  <div className="text-sm text-gray-600 dark:text-zinc-300">House 12, Road 5, Gulshan-1, Dhaka - 1212</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">Phone: {user.phone || "01700000000"}</div>
                  <div className="text-xs text-gray-500 dark:text-zinc-400">Email: {user.email}</div>
                </div>
              </div>
            )}

            {tab === "profile" && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border">
                <h2 className="font-black">PROFILE SETTINGS</h2>
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <label>
                    <span className="text-xs font-bold">Full Name</span>
                    <input value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
                  </label>
                  <label>
                    <span className="text-xs font-bold">Phone</span>
                    <input value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} className="w-full mt-1 border rounded-xl px-4 py-3 text-sm" />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="text-xs font-bold">Email</span>
                    <input value={profileForm.email} readOnly className="w-full mt-1 border rounded-xl px-4 py-3 text-sm bg-gray-50 dark:bg-zinc-800" />
                    <span className="text-xs text-gray-500 dark:text-zinc-400">Email cannot be changed</span>
                  </label>
                  <button className="sm:col-span-2 bg-black text-white font-bold py-3 rounded-full mt-2">Save Changes</button>
                  <Link href="/auth/change-password" className="sm:col-span-2 text-center border-2 border-black font-bold py-3 rounded-full hover:bg-black hover:text-white transition">🔑 Change Password</Link>
                </div>
                <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
                  <strong>💡 Tip:</strong> Checkout e auto-create account er password ekhane set korun. <Link href="/auth/change-password" className="underline font-bold">Change Password page</Link> e giye current password charai new password dite parben (token diye verified).
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}