import { NextResponse } from "next/server";
import { findUserByEmail, createUser, generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hoko_secret_2026";

export async function POST(req: Request) {
  try {
    const { name, email, phone } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const emailLower = email.toLowerCase();
    const conn = await connectDB();
    if (conn) {
      let user = await (User as any).findOne({ email: emailLower });
      if (user) {
        const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
        return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email }, token, created: false });
      }
      // auto-create with random password placeholder (user can set later)
      user = await (User as any).create({
        name: name || email.split("@")[0],
        email: emailLower,
        phone: phone || "",
        provider: "credentials",
        role: "customer",
        // no password yet - user can set via change-password with token
      });
      const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
      return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email }, token, created: true });
    }

    let user = findUserByEmail(emailLower);
    if (user) {
      const token = generateToken({ _id: user._id, name: user.name, email: user.email, provider: user.provider, role: user.role });
      return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email }, token, created: false });
    }
    user = createUser({ name: name || email.split("@")[0], email: emailLower, phone, provider: "credentials" });
    const token = generateToken({ _id: user._id, name: user.name, email: user.email, provider: user.provider, role: user.role });
    return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email }, token, created: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
