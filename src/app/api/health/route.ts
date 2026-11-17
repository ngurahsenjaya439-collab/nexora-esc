import { NextResponse } from "next/server";

import { prisma } from "@/server/db/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({
      status: "ok",
      app: "NEXORA",
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { status: "error", app: "NEXORA" },
      { status: 500 },
    );
  }
}
