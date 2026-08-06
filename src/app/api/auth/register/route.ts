import { NextResponse } from "next/server";
import { createUser, findUserByEmail, generateToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, phone } = await req.json();
    if (!name || !email || !password) return NextResponse.json({ error: "Name, email, password required" }, { status: 400 });
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });

    const conn = await connectDB();
    if (conn) {
      const existing = await (User as any).findOne({ email: email.toLowerCase() });
      if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });
      const hashed = bcrypt.hashSync(password, 10);
      const user = await (User as any).create({ name, email: email.toLowerCase(), password: hashed, phone, provider: "credentials", role: "customer" });
      const token = generateToken({ _id: user._id.toString(), name: user.name, email: user.email, provider: user.provider, role: user.role } as any);
      return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, token });
    }

    // fallback
    const existing = findUserByEmail(email);
    if (existing) return NextResponse.json({ error: "Email already exists" }, { status: 400 });
    const user = createUser({ name, email, password, phone });
    const token = generateToken({ _id: user._id, name: user.name, email: user.email, provider: user.provider, role: user.role });
    return NextResponse.json({ user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role }, token }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}


