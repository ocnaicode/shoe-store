import { NextResponse } from "next/server";
import { createUser, findUserByEmail } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

/** Creates a checkout customer only; it never signs a user in or reveals an existing account. */
export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!normalizedEmail) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const conn = await connectDB();
    if (conn) {
      const existing = await (User as any).findOne({ email: normalizedEmail }).lean();
      if (existing) return NextResponse.json({ created: false });
      await (User as any).create({ name: typeof name === "string" && name.trim() ? name.trim() : normalizedEmail.split("@")[0], email: normalizedEmail, phone: typeof phone === "string" ? phone : "", provider: "credentials", role: "customer" });
    } else if (!findUserByEmail(normalizedEmail)) {
      createUser({ name: typeof name === "string" && name.trim() ? name.trim() : normalizedEmail.split("@")[0], email: normalizedEmail, phone, provider: "credentials" });
    }
    return NextResponse.json({ created: true });
  } catch { return NextResponse.json({ error: "Unable to create checkout profile" }, { status: 500 }); }
}
