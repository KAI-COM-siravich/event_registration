import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";
import { logAuditAction } from "@/lib/auditLog";

import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";
import { BoothSchema } from "@/lib/validations";

export async function GET() {
  try {
    const booths = await prisma.booth.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        event: {
          select: { name: true }
        }
      }
    });
    return NextResponse.json(booths);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch booths" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Admin can create booths." }, { status: 403 });
    }

    const body = await req.json();
    const validationResult = BoothSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const newBoothId = await generateId("Booth", "ID_PREFIX_BOOTH", "BTH-");
    const booth = await prisma.booth.create({
      data: {
        id: newBoothId,
        name: data.name,
        eventId: data.eventId,
      },
      include: {
        event: {
          select: { name: true }
        }
      }
    });

    await logAuditAction(`Created Booth: ${booth.name} (${booth.id})`);

    return NextResponse.json(booth, { status: 201 });
  } catch (error) {
    console.error("Failed to create booth:", error);
    return NextResponse.json(
      { error: "Failed to create booth" },
      { status: 500 }
    );
  }
}
