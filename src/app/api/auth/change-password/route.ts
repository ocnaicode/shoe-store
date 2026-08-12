import { NextResponse } from "next/server";
import { getSessionFromRequest, updateUserPasswordById, verifyPassword, hashPassword } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ error: "Please sign in to change your password" }, { status: 401 });
  try {
    const { currentPassword, newPassword } = await req.json();
    if (typeof newPassword !== "string" || newPassword.length < 8) return NextResponse.json({ error: "New password must be at least 8 characters" }, { status: 400 });
    const conn = await connectDB();
    if (conn) {
      const user = await (User as any).findById(session.sub);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (!user.password || typeof currentPassword !== "string" || !bcrypt.compareSync(currentPassword, user.password)) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      user.password = bcrypt.hashSync(newPassword, 12);
      await user.save();
    } else {
      const { findUserById } = await import("@/lib/auth");
      const user = findUserById(session.sub);
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      if (!user.password || typeof currentPassword !== "string" || !verifyPassword(currentPassword, user.password)) return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
      updateUserPasswordById(session.sub, newPassword);
    }
    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch {
    return NextResponse.json({ error: "Unable to update password" }, { status: 500 });
  }
}
