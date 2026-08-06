import { NextResponse } from "next/server";
import { verifyToken, findUserById } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "hoko_secret_2026";

export async function GET(req: Request) {
  try {
    const auth = req.headers.get("authorization");
    const token = auth?.replace("Bearer ", "") || new URL(req.url).searchParams.get("token");
    if (!token) return NextResponse.json({ user: null }, { status: 401 });
    const decoded: any = jwt.verify(token, JWT_SECRET);
    if (!decoded) return NextResponse.json({ user: null }, { status: 401 });

    const conn = await connectDB();
    if (conn) {
      const user = await (User as any).findById(decoded.id).select("-password");
      if (!user) return NextResponse.json({ user: null }, { status: 404 });
      return NextResponse.json({ user });
    }
    const user = findUserById(decoded.id);
    if (!user) return NextResponse.json({ user: null }, { status: 404 });
    const { password, ...safe } = user;
    return NextResponse.json({ user: safe });
  } catch (e: any) {
    return NextResponse.json({ user: null, error: e.message }, { status: 401 });
  }
}
