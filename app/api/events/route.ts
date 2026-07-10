import { logAuditAction } from "@/lib/auditLog";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";
import { EventSchema } from "@/lib/validations";

export async function GET() {
  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    orderBy: { date: "asc" },
    select: { id: true, name: true, date: true, location: true },
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Admin can create events." }, { status: 403 });
    }

    const body = await req.json();
    const validationResult = EventSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const data = validationResult.data;
    const newEventId = await generateId("Event", "ID_PREFIX_EVENT", "EVT-");
    const event = await prisma.event.create({
      data: {
        id: newEventId,
        name: data.name,
        description: data.description || null,
        date: new Date(data.date),
        location: data.location,
      },
    });
    
    await logAuditAction(`Created Event: ${event.name} (${event.id})`);
    
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
