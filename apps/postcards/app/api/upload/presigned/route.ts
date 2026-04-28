// Deprecated: upload is now handled by /api/upload (direct multipart POST).
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This endpoint has been removed. Use /api/upload instead." },
    { status: 410 }
  );
}
