import { products } from "@/lib/data";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Products", value: products.length, change: "+2 this week", icon: "👟", color: "bg-amber-500" },
    { label: "Total Orders", value: "128", change: "+12% from last month", icon: "📦", color: "bg-black dark:bg-zinc-700" },
    { label: "Revenue", value: "৳2,45,890", change: "+8% from last month", icon: "💰", color: "bg-green-600" },
    { label: "Customers", value: "1,240", change: "+5% new users", icon: "👥", color: "bg-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-black dark:text-white">Dashboard Overview</h2>
        <p className="text-sm text-gray-500 dark:text-zinc-400">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 rounded-xl p-5 border border-gray-100 dark:border-zinc-800">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-medium tracking-wide text-gray-500 dark:text-zinc-400 uppercase">{s.label}</div>
                <div className="text-2xl font-semibold mt-1 text-black dark:text-white">{s.value}</div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">{s.change}</div>
              </div>
              <div className={`w-10 h-10 ${s.color} text-white rounded-lg flex items-center justify-center text-lg`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-black dark:text-white">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-medium text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white underline">View All</Link>
          </div>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 dark:text-zinc-400 border-b border-gray-100 dark:border-zinc-800">
                <tr>
                  <th className="text-left py-2 font-medium">Order ID</th>
                  <th className="text-left py-2 font-medium">Customer</th>
                  <th className="text-left py-2 font-medium">Total</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "HOKO845123", customer: "Rahim Ahmed", total: "৳4,590", status: "pending" },
                  { id: "HOKO845122", customer: "Karim Uddin", total: "৳6,890", status: "processing" },
                  { id: "HOKO845121", customer: "Fatima Khan", total: "৳12,480", status: "shipped" },
                  { id: "HOKO845120", customer: "Sakib Hasan", total: "৳3,890", status: "delivered" },
                ].map((o) => (
                  <tr key={o.id} className="border-b border-gray-50 dark:border-zinc-800 last:border-0">
                    <td className="py-3 font-mono font-medium text-black dark:text-white">{o.id}</td>
                    <td className="py-3 text-gray-600 dark:text-zinc-300">{o.customer}</td>
                    <td className="py-3 font-medium text-black dark:text-white">{o.total}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium uppercase ${o.status === "delivered" ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30" : o.status === "shipped" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30" : "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30"}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800">
          <h3 className="font-medium text-black dark:text-white">Quick Actions</h3>
          <div className="space-y-3 mt-4">
            <Link href="/admin/products" className="flex items-center gap-3 bg-black dark:bg-white text-white dark:text-black rounded-xl p-4 hover:bg-zinc-800 dark:hover:bg-zinc-200 transition">
              <span className="w-9 h-9 bg-white/15 dark:bg-black/10 rounded-lg flex items-center justify-center text-sm">＋</span>
              <div>
                <div className="font-medium text-sm">Add New Product</div>
                <div className="text-xs opacity-60">Upload with Cloudinary</div>
              </div>
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 border border-gray-200 dark:border-zinc-700 rounded-xl p-4 hover:bg-gray-50 dark:bg-zinc-800 dark:hover:bg-zinc-800 transition">
              <span className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center text-sm">⚙</span>
              <div>
                <div className="font-medium text-sm text-black dark:text-white">Cloudinary Setup</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">Configure image upload</div>
              </div>
            </Link>
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-4 text-xs">
              <div className="font-medium text-amber-900 dark:text-amber-100">💡 SEO Tip</div>
              <p className="text-amber-800/70 dark:text-amber-200/60 mt-1 leading-relaxed">All product pages are auto SEO optimized with JSON-LD, sitemap & meta tags for Google ranking.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl p-6 border border-gray-100 dark:border-zinc-800">
        <h3 className="font-medium text-black dark:text-white">Top Selling Products</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {products.slice(0, 4).map((p) => (
            <div key={p._id} className="flex gap-3 border border-gray-100 dark:border-zinc-800 rounded-xl p-3 bg-white dark:bg-zinc-900 hover:border-gray-200 dark:hover:border-zinc-700 transition">
              <img src={p.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover bg-gray-50 dark:bg-zinc-800" />
              <div className="min-w-0 flex-1">
                <div className="font-medium text-sm line-clamp-1 text-black dark:text-white">{p.name}</div>
                <div className="text-xs text-gray-500 dark:text-zinc-400">{p.category}</div>
                <div className="font-semibold text-sm text-black dark:text-white">৳{p.price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}