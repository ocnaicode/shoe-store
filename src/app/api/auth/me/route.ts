import { NextResponse } from "next/server";
import { findUserById, getSessionFromRequest } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

export async function GET(req: Request) {
  const session = getSessionFromRequest(req);
  if (!session) return NextResponse.json({ user: null }, { status: 401 });
  try {
    const conn = await connectDB();
    const user = conn ? await (User as any).findById(session.sub).select("-password").lean() : findUserById(session.sub);
    if (!user) return NextResponse.json({ user: null }, { status: 401 });
    return NextResponse.json({ user: { _id: user._id.toString(), name: user.name, email: user.email, phone: user.phone, avatar: user.avatar, role: user.role } });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
