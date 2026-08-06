import { NextResponse } from "next/server";
import { findUserByEmail, updateUserPassword, verifyPassword } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hoko_secret_2026";

export async function POST(req: Request) {
  try {
    const { email, currentPassword, newPassword, token } = await req.json();

    // If token provided, verify and allow change without currentPassword (set password flow)
    let targetEmail = email;
    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        targetEmail = decoded.email;
      } catch {
        return NextResponse.json({ error: "Invalid token" }, { status: 401 });
      }
    }

    if (!targetEmail || !newPassword) return NextResponse.json({ error: "Email and new password required" }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      const user = await (User as any).findOne({ email: targetEmail.toLowerCase() });
      if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
      // if not token, verify current password if user has password
      if (!token && user.password) {
        if (!currentPassword || !bcrypt.compareSync(currentPassword, user.password)) {
          return NextResponse.json({ error: "Current password incorrect" }, { status: 401 });
        }
      }
      user.password = bcrypt.hashSync(newPassword, 10);
      await user.save();
      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }

    const user = findUserByEmail(targetEmail);
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (!token && user.password) {
      if (!currentPassword || !verifyPassword(currentPassword, user.password)) {
        return NextResponse.json({ error: "Current password incorrect" }, { status: 401 });
      }
    }
    updateUserPassword(targetEmail, newPassword);
    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
