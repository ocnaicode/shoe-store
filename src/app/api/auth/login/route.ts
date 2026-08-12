import { NextResponse } from "next/server";
import { findUserByEmail, verifyPassword, generateToken, sessionCookie, type AuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const publicUser = (user: { _id: { toString(): string } | string; name: string; email: string; phone?: string; role: "customer" | "admin"; avatar?: string }) => ({ _id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, role: user.role, avatar: user.avatar });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

    const conn = await connectDB();
    let user: AuthUser | null = null;
    if (conn) {
      const record = await (User as any).findOne({ email }).lean();
      if (!record?.password || !bcrypt.compareSync(password, record.password)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      user = publicUser(record) as AuthUser;
    } else {
      const record = findUserByEmail(email);
      if (!record?.password || !verifyPassword(password, record.password)) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
      user = publicUser(record) as AuthUser;
    }
    const response = NextResponse.json({ user });
    response.headers.set("Set-Cookie", sessionCookie(generateToken(user)));
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to sign in. Please try again later." }, { status: 500 });
  }
}
