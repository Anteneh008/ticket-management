import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await requireRole("admin");

  const agents = await prisma.user.findMany({
    where: { role: "agent" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  return NextResponse.json(agents);
}
