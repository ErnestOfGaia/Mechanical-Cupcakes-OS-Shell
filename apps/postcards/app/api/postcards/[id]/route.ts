export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/db";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any)?.id ?? "";
    const body = await request.json();
    const { isRead, isSaved } = body ?? {};

    const postcard = await prisma.postcard.findUnique({ where: { id: params?.id ?? "" } });
    if (!postcard || postcard?.recipientId !== userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (typeof isRead === "boolean") updateData.isRead = isRead;
    if (typeof isSaved === "boolean") updateData.isSaved = isSaved;

    const updated = await prisma.postcard.update({
      where: { id: params?.id ?? "" },
      data: updateData,
    });

    return NextResponse.json({ success: true, postcard: { ...updated, createdAt: updated?.createdAt?.toISOString?.() ?? "" } });
  } catch (e: any) {
    console.error("Error updating postcard:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
