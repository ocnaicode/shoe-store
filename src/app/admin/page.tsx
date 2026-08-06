import { products } from "@/lib/data";
import Link from "next/link";

export default function AdminDashboard() {
  const stats = [
    { label: "Total Products", value: products.length, change: "+2 this week", icon: "👟", color: "bg-amber-500" },
    { label: "Total Orders", value: "128", change: "+12% from last month", icon: "📦", color: "bg-black" },
    { label: "Revenue", value: "৳2,45,890", change: "+8% from last month", icon: "💰", color: "bg-green-600" },
    { label: "Customers", value: "1,240", change: "+5% new users", icon: "👥", color: "bg-blue-600" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-black">Dashboard Overview</h2>
        <p className="text-sm text-gray-500">Welcome back, Admin. Here&apos;s what&apos;s happening today.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 border">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold tracking-widest text-gray-500">{s.label.toUpperCase()}</div>
                <div className="text-2xl font-black mt-1">{s.value}</div>
                <div className="text-xs text-green-600 mt-1">{s.change}</div>
              </div>
              <div className={`w-12 h-12 ${s.color} text-white rounded-xl flex items-center justify-center text-xl`}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border">
          <div className="flex items-center justify-between">
            <h3 className="font-black">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs font-bold underline">View All</Link>
          </div>
          <div className="mt-4 overflow-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-gray-500 border-b">
                <tr>
                  <th className="text-left py-2 font-bold">Order ID</th>
                  <th className="text-left py-2 font-bold">Customer</th>
                  <th className="text-left py-2 font-bold">Total</th>
                  <th className="text-left py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: "HOKO845123", customer: "Rahim Ahmed", total: "৳4,590", status: "pending" },
                  { id: "HOKO845122", customer: "Karim Uddin", total: "৳6,890", status: "processing" },
                  { id: "HOKO845121", customer: "Fatima Khan", total: "৳12,480", status: "shipped" },
                  { id: "HOKO845120", customer: "Sakib Hasan", total: "৳3,890", status: "delivered" },
                ].map((o) => (
                  <tr key={o.id} className="border-b last:border-0">
                    <td className="py-3 font-mono font-bold">{o.id}</td>
                    <td className="py-3">{o.customer}</td>
                    <td className="py-3 font-bold">{o.total}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${o.status === "delivered" ? "bg-green-100 text-green-700" : o.status === "shipped" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>{o.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border">
          <h3 className="font-black">Quick Actions</h3>
          <div className="space-y-3 mt-4">
            <Link href="/admin/products" className="flex items-center gap-3 bg-black text-white rounded-xl p-4 hover:bg-zinc-800 transition">
              <span className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">+</span>
              <div>
                <div className="font-bold text-sm">Add New Product</div>
                <div className="text-xs opacity-60">Upload with Cloudinary</div>
              </div>
            </Link>
            <Link href="/admin/settings" className="flex items-center gap-3 border rounded-xl p-4 hover:bg-gray-50 transition">
              <span className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">⚙️</span>
              <div>
                <div className="font-bold text-sm">Cloudinary Setup</div>
                <div className="text-xs text-gray-500">Configure image upload</div>
              </div>
            </Link>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs">
              <div className="font-bold">💡 SEO Tip</div>
              <p className="text-gray-600 mt-1">All product pages are auto SEO optimized with JSON-LD, sitemap & meta tags for Google ranking.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border">
        <h3 className="font-black">Top Selling Products</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {products.slice(0, 4).map((p) => (
            <div key={p._id} className="flex gap-3 border rounded-xl p-3">
              <img src={p.images[0]} alt="" className="w-16 h-16 rounded-lg object-cover bg-gray-50" />
              <div>
                <div className="font-bold text-sm line-clamp-1">{p.name}</div>
                <div className="text-xs text-gray-500">{p.category}</div>
                <div className="font-black text-sm">৳{p.price.toLocaleString()}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
