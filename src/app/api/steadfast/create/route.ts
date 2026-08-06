import { NextResponse } from "next/server";
import { getSettings } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const settings = getSettings();
    const { apiKey, secretKey, baseUrl, enabled } = settings.steadfast;

    if (!enabled || !apiKey || !secretKey) {
      return NextResponse.json({
        success: false,
        mock: true,
        message: "Steadfast not configured - returning mock consignment. Configure in Admin > Settings > Courier.",
        consignment: {
          consignment_id: "STED-MOCK-" + Date.now().toString().slice(-6),
          tracking_code: "MOCK" + Math.floor(100000 + Math.random() * 900000),
          status: "pending",
          ...body,
        },
      });
    }

    // Real API call to Steadfast
    const payload = {
      invoice: body.invoice || "HOKO" + Date.now().toString().slice(-6),
      recipient_name: body.recipient_name,
      recipient_phone: body.recipient_phone,
      recipient_address: body.recipient_address,
      cod_amount: body.cod_amount || body.total || 0,
      note: body.note || "HOKO Lifestyle BD - Shoe Order",
    };

    const res = await fetch(`${baseUrl}/create_order`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
        "Secret-Key": secretKey,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ success: false, error: data.message || "Steadfast API error", data }, { status: 400 });
    return NextResponse.json({ success: true, data });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, mock: true }, { status: 500 });
  }
}
