import { NextResponse } from "next/server";
import { getFallbackUsers, saveFallbackUsers, connectDB } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email, role, secret } = await req.json();
    if (!email || !role) return NextResponse.json({ error: "Email and role required" }, { status: 400 });
    // Simple secret check for admin promotion
    if (secret !== "hoko_admin_secret" && secret !== process.env.JWT_SECRET) {
      // Allow if email is default admin without secret for ease
      if (email !== "admin@hokolifestylebd.com") {
        return NextResponse.json({ error: "Invalid secret" }, { status: 403 });
      }
    }

    const conn = await connectDB();
    if (conn) {
      const user = await (User as any).findOneAndUpdate(
        { email: email.toLowerCase() },
        { role },
        { new: true }
      );
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      return NextResponse.json({ success: true, user: { _id: user._id, email: user.email, role: user.role } });
    }

    const users = getFallbackUsers();
    const idx = users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
    if (idx === -1) return NextResponse.json({ error: "User not found - please register first" }, { status: 404 });
    users[idx].role = role;
    saveFallbackUsers(users);
    return NextResponse.json({ success: true, user: users[idx] });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
