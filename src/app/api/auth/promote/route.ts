import { NextResponse } from "next/server";
import { getSessionFromRequest, findUserById } from "@/lib/auth";
import { connectDB, getFallbackUsers, saveFallbackUsers } from "@/lib/db";
import User from "@/models/User";

/** Role management is deliberately restricted to an already authenticated admin. */
export async function POST(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== "admin") return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const role = body.role;
    if (!email || !["customer", "admin"].includes(role)) return NextResponse.json({ error: "Valid email and role are required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      const user = await (User as any).findOneAndUpdate({ email }, { role }, { new: true }).select("-password");
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      return NextResponse.json({ user: { _id: user._id, email: user.email, role: user.role } });
    }
    const users = getFallbackUsers();
    const index = users.findIndex((user: { email: string }) => user.email.toLowerCase() === email);
    if (index < 0) return NextResponse.json({ error: "User not found" }, { status: 404 });
    users[index].role = role;
    saveFallbackUsers(users);
    return NextResponse.json({ user: { _id: users[index]._id, email: users[index].email, role: users[index].role } });
  } catch {
    return NextResponse.json({ error: "Unable to update user role" }, { status: 500 });
  }
}
