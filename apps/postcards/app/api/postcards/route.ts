export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";
import nodemailer from "nodemailer";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any)?.id ?? "";
    const url = new URL(request?.url ?? "http://localhost");
    const type = url?.searchParams?.get("type") ?? "received";

    let postcards: any[] = [];
    if (type === "received") {
      postcards = await prisma.postcard.findMany({
        where: { recipientId: userId },
        include: { sender: { select: { username: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "sent") {
      postcards = await prisma.postcard.findMany({
        where: { senderId: userId },
        include: { recipient: { select: { username: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "saved") {
      postcards = await prisma.postcard.findMany({
        where: { recipientId: userId, isSaved: true },
        include: { sender: { select: { username: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else if (type === "unread") {
      postcards = await prisma.postcard.findMany({
        where: { recipientId: userId, isRead: false },
        include: { sender: { select: { username: true, email: true } } },
        orderBy: { createdAt: "desc" },
      });
    }

    const resolved = (postcards ?? []).map((pc: any) => ({
      ...pc,
      createdAt: pc?.createdAt?.toISOString?.() ?? "",
    }));

    return NextResponse.json({ postcards: resolved ?? [] });
  } catch (e: any) {
    console.error("Error fetching postcards:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const senderId = (session.user as any)?.id ?? "";
    const body = await request.json();
    const { message, cloudStoragePath, isPublic, imageUrl } = body ?? {};

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Find recipient (the other user)
    const recipient = await prisma.user.findFirst({
      where: { id: { not: senderId }, NOT: { email: "john@doe.com" } },
    });

    if (!recipient) {
      return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
    }

    const postcard = await prisma.postcard.create({
      data: {
        senderId,
        recipientId: recipient.id,
        imageUrl: imageUrl ?? "",
        cloudStoragePath: cloudStoragePath ?? "",
        isPublic: isPublic ?? true,
        message,
      },
    });

    // Send email notification via SMTP (non-blocking — skipped if SMTP_HOST is not configured)
    try {
      const smtpHost = process.env.SMTP_HOST;
      if (smtpHost) {
        const sender = await prisma.user.findUnique({ where: { id: senderId } });
        const appUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const fromAddress = process.env.SMTP_FROM || `noreply@${new URL(appUrl).hostname}`;

        const htmlBody = `
          <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #fff1f2, #fef3c7); padding: 30px; border-radius: 16px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <span style="font-size: 48px;">💌</span>
              <h2 style="color: #be123c; margin: 10px 0;">You've Got Mail!</h2>
            </div>
            <div style="background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
              <p style="color: #374151; font-size: 16px;">A new postcard from <strong style="color: #be123c;">${sender?.username ?? "someone special"}</strong> is waiting in your mailbox!</p>
              <p style="color: #6b7280; font-style: italic; margin-top: 12px;">"${(message ?? "").substring(0, 100)}${(message?.length ?? 0) > 100 ? "..." : ""}"</p>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <a href="${appUrl}/mailbox" style="display: inline-block; background: #be123c; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Open Your Mailbox</a>
            </div>
            <p style="text-align: center; color: #9ca3af; font-size: 12px; margin-top: 16px;">Sent with love from Love Mailbox ❤️</p>
          </div>
        `;

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT ?? "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: process.env.SMTP_USER ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS ?? "",
          } : undefined,
        });

        await transporter.sendMail({
          from: `"Love Mailbox" <${fromAddress}>`,
          to: recipient?.email ?? "",
          subject: `💌 New postcard from ${sender?.username ?? "someone special"}!`,
          html: htmlBody,
        });
      }
    } catch (emailErr: any) {
      console.error("Email notification error (non-blocking):", emailErr);
    }

    return NextResponse.json({ success: true, postcard: { ...postcard, createdAt: postcard?.createdAt?.toISOString?.() ?? "" } });
  } catch (e: any) {
    console.error("Error creating postcard:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
