import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hoko_secret_2026";

export async function POST(req: Request) {
  try {
    const { email, password, provider, providerId, name, avatar } = await req.json();

    // Social login mock
    if (provider && provider !== "credentials") {
      const conn = await connectDB();
      const emailLower = email.toLowerCase();
      if (conn) {
        let user = await (User as any).findOne({ email: emailLower });
        if (!user) {
          user = await (User as any).create({ name, email: emailLower, provider, providerId, avatar, role: "customer", emailVerified: true });
        }
        const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
        return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }, token });
      }
      // fallback
      let user = findUserByEmail(emailLower);
      if (!user) {
        const { createUser } = await import("@/lib/auth");
        user = createUser({ name, email: emailLower, provider, providerId, avatar });
      }
      const token = generateToken({ _id: user._id, name: user.name, email: user.email, provider: user.provider, role: user.role });
      return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, role: user.role }, token });
    }

    // Credentials login
    if (!email || !password) return NextResponse.json({ error: "Email and password required" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      const user = await (User as any).findOne({ email: email.toLowerCase() });
      if (!user || !user.password) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const valid = bcrypt.compareSync(password, user.password);
      if (!valid) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
      const token = jwt.sign({ id: user._id.toString(), email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "30d" });
      return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }, token });
    }

    const user = findUserByEmail(email);
    if (!user || !user.password) return NextResponse.json({ error: "Invalid credentials or social account" }, { status: 401 });
    if (!verifyPassword(password, user.password)) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    const token = generateToken({ _id: user._id, name: user.name, email: user.email, provider: user.provider, role: user.role });
    return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar }, token });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
