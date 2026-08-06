import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { orderId, email } = await req.json();
    if (!orderId || !email) return NextResponse.json({ error: "Order ID and email required" }, { status: 400 });

    // Mock email sending - in production integrate with Nodemailer / SendGrid / Resend
    console.log(`📧 [MOCK EMAIL] Sending invoice for ${orderId} to ${email}`);
    console.log(`Invoice URL: https://hokolifestylebd.com/invoice/${orderId}`);

    // Simulate delay
    await new Promise((r) => setTimeout(r, 500));

    return NextResponse.json({
      success: true,
      message: `✅ Invoice for ${orderId} sent to ${email}! (Mock - integrate real email service via Nodemailer/SendGrid in production. Invoice URL: /invoice/${orderId})`,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "orderId required" }, { status: 400 });
  return NextResponse.json({ url: `/invoice/${orderId}`, message: "Visit this URL to view/download invoice" });
}
