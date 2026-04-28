export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password, username } = await request.json();
    if (!email || !password || !username) {
      return NextResponse.json({ error: "All fields required" }, { status: 400 });
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });
    if (existing) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashed, username },
    });
    return NextResponse.json({ success: true, user: { id: user.id, username: user.username, email: user.email } });
  } catch (e: any) {
    console.error("Signup error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
