"use client";
import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function InvoiceClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try API first, then localStorage
    fetch(`/api/orders?orderId=${orderId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.order) {
          setOrder(data.order);
          setLoading(false);
        } else {
          // fallback localStorage
          const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
          const found = local.find((o: any) => o.id === orderId || o.orderId === orderId);
          setOrder(found || null);
          setLoading(false);
        }
      })
      .catch(() => {
        const local = JSON.parse(localStorage.getItem("hoko_orders") || "[]");
        const found = local.find((o: any) => o.id === orderId || o.orderId === orderId);
        setOrder(found || null);
        setLoading(false);
      });
  }, [orderId]);

  const handleDownload = async () => {
    // Use jsPDF to generate PDF
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 35, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("HOKO", 14, 18);
    doc.setTextColor(245, 158, 11);
    doc.text("LIFESTYLE BD", 35, 18);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Premium Shoe Store • Gulshan-1, Dhaka • +880 1700-000000", 14, 26);
    doc.text("hello@hokolifestylebd.com • www.hokolifestylebd.com", 14, 31);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("INVOICE", 14, 50);
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Order ID: ${order.id || order.orderId}`, 14, 58);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleString()}`, 14, 64);
    doc.text(`Payment: ${(order.paymentMethod || "COD").toUpperCase()}`, 14, 70);
    doc.text(`Status: ${order.status?.toUpperCase()}`, 14, 76);

    // Customer
    doc.setFont("helvetica", "bold");
    doc.text("Bill To:", 120, 50);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    const customer = order.customer;
    doc.text(customer?.name || "Customer", 120, 58);
    doc.text(customer?.phone || "", 120, 64);
    doc.text(customer?.email || "", 120, 70);
    const addr = customer?.address || "";
    const addrLines = doc.splitTextToSize(addr, 80);
    doc.text(addrLines, 120, 76);

    // Table Header
    let y = 100;
    doc.setFillColor(240, 240, 240);
    doc.rect(14, y - 8, 182, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Item", 16, y);
    doc.text("Size", 90, y);
    doc.text("Qty", 110, y);
    doc.text("Price", 130, y);
    doc.text("Total", 165, y);
    y += 6;
    doc.setFont("helvetica", "normal");

    // Items
    (order.items || []).forEach((item: any) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text((item.name || "").substring(0, 35), 16, y);
      doc.text(String(item.size || "-"), 90, y);
      doc.text(String(item.quantity), 110, y);
      doc.text(formatPrice(item.price), 130, y);
      doc.text(formatPrice(item.price * item.quantity), 165, y);
      y += 7;
    });

    // Totals
    y += 4;
    doc.setDrawColor(200);
    doc.line(120, y, 196, y);
    y += 8;
    doc.setFont("helvetica", "normal");
    doc.text("Subtotal:", 130, y);
    doc.text(formatPrice(order.subtotal || order.total), 165, y);
    y += 6;
    if (order.discount > 0) {
      doc.setTextColor(0, 150, 0);
      doc.text(`Discount (${order.couponCode}):`, 130, y);
      doc.text(`-${formatPrice(order.discount)}`, 165, y);
      doc.setTextColor(0, 0, 0);
      y += 6;
    }
    doc.text("Shipping:", 130, y);
    doc.text(formatPrice(order.shipping || 0), 165, y);
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Total:", 130, y);
    doc.text(formatPrice(order.total), 165, y);

    // Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("Thank you for shopping with HOKO Lifestyle BD!", 14, 285);
    doc.text("7 days return | 100% original | Cash on delivery available", 14, 290);
    doc.text(`Invoice generated on ${new Date().toLocaleString()}`, 14, 295);

    doc.save(`HOKO-Invoice-${order.id || order.orderId}.pdf`);
  };

  const handleEmail = async () => {
    const email = order?.customer?.email;
    if (!email) return alert("Customer email not found");
    try {
      const res = await fetch("/api/invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.id || order.orderId, email }),
      });
      const data = await res.json();
      alert(data.message || "✅ Invoice email sent! (Mock - check console)");
    } catch (e: any) {
      alert("❌ " + e.message);
    }
  };

  if (loading) return <div className="text-center py-12">Loading invoice...</div>;
  if (!order) return <div className="text-center py-12"><h2 className="text-xl font-black">Order not found</h2><p className="text-sm text-gray-500 dark:text-zinc-400">Check Order ID: {orderId}</p><Link href="/track-order" className="mt-4 inline-block bg-black text-white px-6 py-3 rounded-full font-bold">Track Order</Link></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black">Invoice</h1>
          <p className="text-sm text-gray-500 dark:text-zinc-400">Order #{order.id || order.orderId} • {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="bg-black text-white font-bold px-6 py-3 rounded-full hover:bg-zinc-800 flex items-center gap-2">
            📄 Download PDF
          </button>
          <button onClick={handleEmail} className="border-2 border-black font-bold px-6 py-3 rounded-full hover:bg-black hover:text-white">
            📧 Email Invoice
          </button>
        </div>
      </div>

      <div id="invoice" className="bg-white dark:bg-zinc-900 rounded-2xl border-2 border-gray-200 dark:border-zinc-700 overflow-hidden">
        {/* Header */}
        <div className="bg-black text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-white dark:bg-zinc-900 text-black dark:text-white flex items-center justify-center font-black text-xl rounded">H</div>
                <div>
                  <div className="font-black text-lg">HOKO<span className="text-amber-500">LIFESTYLE</span> BD</div>
                  <div className="text-xs opacity-60">Premium Shoe Store</div>
                </div>
              </div>
              <div className="text-xs opacity-70 mt-3">
                Gulshan-1, Dhaka, Bangladesh<br />
                +880 1700-000000 • hello@hokolifestylebd.com<br />
                www.hokolifestylebd.com
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black">INVOICE</div>
              <div className="text-sm opacity-70 mt-1">#{order.id || order.orderId}</div>
              <div className={`mt-2 px-3 py-1 rounded-full text-xs font-bold inline-block ${order.status === "delivered" ? "bg-green-500" : order.status === "shipped" ? "bg-blue-500" : "bg-amber-500"} text-white uppercase`}>{order.status}</div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-black text-sm tracking-widest text-gray-500 dark:text-zinc-400">BILL TO</h3>
              <div className="mt-2">
                <div className="font-bold">{order.customer?.name}</div>
                <div className="text-sm text-gray-600 dark:text-zinc-300">{order.customer?.phone}</div>
                <div className="text-sm text-gray-600 dark:text-zinc-300">{order.customer?.email}</div>
                <div className="text-sm text-gray-600 dark:text-zinc-300 mt-1">{order.customer?.address}</div>
              </div>
            </div>
            <div className="md:text-right">
              <h3 className="font-black text-sm tracking-widest text-gray-500 dark:text-zinc-400">INVOICE DETAILS</h3>
              <div className="mt-2 text-sm space-y-1">
                <div><span className="text-gray-500 dark:text-zinc-400">Date:</span> <span className="font-bold">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                <div><span className="text-gray-500 dark:text-zinc-400">Payment:</span> <span className="font-bold uppercase">{order.paymentMethod}</span></div>
                <div><span className="text-gray-500 dark:text-zinc-400">Shipping via:</span> <span className="font-bold">Steadfast Courier</span></div>
              </div>
            </div>
          </div>

          <div className="mt-8 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-zinc-800">
                  <th className="text-left p-3 font-black">Item</th>
                  <th className="text-center p-3 font-black">Size</th>
                  <th className="text-center p-3 font-black">Qty</th>
                  <th className="text-right p-3 font-black">Price</th>
                  <th className="text-right p-3 font-black">Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item: any, i: number) => (
                  <tr key={i} className="border-b">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-50 dark:bg-zinc-800 hidden sm:block" />
                        <div>
                          <div className="font-bold line-clamp-1">{item.name}</div>
                          <div className="text-xs text-gray-500 dark:text-zinc-400">{item.productId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-center">{item.size}</td>
                    <td className="p-3 text-center">{item.quantity}</td>
                    <td className="p-3 text-right">{formatPrice(item.price)}</td>
                    <td className="p-3 text-right font-bold">{formatPrice(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-80 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-zinc-300">Subtotal</span>
                <span className="font-bold">{formatPrice(order.subtotal || order.total - (order.shipping || 0) + (order.discount || 0))}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount ({order.couponCode})</span>
                  <span className="font-bold">-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-zinc-300">Shipping</span>
                <span className="font-bold">{formatPrice(order.shipping || 0)}</span>
              </div>
              <div className="flex justify-between text-lg font-black border-t pt-3">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div>
              <div className="font-black">Thank you for shopping! 🙏</div>
              <div className="text-gray-600 dark:text-zinc-300 mt-1">7 days easy return • 100% original products<br />Need help? Call 01700-000000 (10AM-10PM)</div>
            </div>
            <div className="text-right">
              <div className="font-bold">HOKO Lifestyle BD</div>
              <div className="text-gray-500 dark:text-zinc-400">Authorized Signature</div>
              <div className="mt-2 w-32 h-px bg-black ml-auto"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-3 justify-center">
        <Link href="/shop" className="border rounded-full px-6 py-3 font-bold hover:bg-gray-50 dark:bg-zinc-800">Continue Shopping</Link>
        <Link href="/track-order" className="bg-black text-white rounded-full px-6 py-3 font-bold">Track Order</Link>
      </div>
    </div>
  );
}
