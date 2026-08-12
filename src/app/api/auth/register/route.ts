import { NextResponse } from "next/server";
import { createUser, findUserByEmail, generateToken, sessionCookie, type AuthUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    if (name.length < 2 || !emailPattern.test(email) || password.length < 8) return NextResponse.json({ error: "Enter a valid name, email, and a password of at least 8 characters" }, { status: 400 });

    const conn = await connectDB();
    let user: AuthUser;
    if (conn) {
      if (await (User as any).exists({ email })) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      const record = await (User as any).create({ name, email, password: bcrypt.hashSync(password, 12), phone, provider: "credentials", role: "customer" });
      user = { _id: record._id.toString(), name: record.name, email: record.email, phone: record.phone, role: record.role, provider: record.provider, avatar: record.avatar };
    } else {
      if (findUserByEmail(email)) return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
      const record = createUser({ name, email, password, phone });
      user = { _id: record._id, name: record.name, email: record.email, phone: record.phone, role: record.role, provider: record.provider, avatar: record.avatar };
    }
    const response = NextResponse.json({ user }, { status: 201 });
    response.headers.set("Set-Cookie", sessionCookie(generateToken(user)));
    return response;
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Unable to create your account. Please try again later." }, { status: 500 });
  }
}
