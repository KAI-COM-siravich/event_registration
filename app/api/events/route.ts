import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    select: { id: true, name: true, date: true, location: true },
  });
  return NextResponse.json(events);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
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
    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("Failed to create event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}
