import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";

export async function GET() {
  try {
    const booths = await prisma.booth.findMany({
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
    const data = await req.json();
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
    return NextResponse.json(booth, { status: 201 });
  } catch (error) {
    console.error("Failed to create booth:", error);
    return NextResponse.json(
      { error: "Failed to create booth" },
      { status: 500 }
    );
  }
}
