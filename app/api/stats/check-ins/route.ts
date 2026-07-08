import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  const stats = await prisma.checkIn.groupBy({
    by: ["registrationId"],
    _count: {
      id: true,
    },
    where: eventId ? { registration: { eventId } } : {},
  });

  const registrations = await prisma.registration.findMany({
    where: { id: { in: stats.map((s) => s.registrationId) } },
    select: { id: true, event: { select: { id: true, name: true } } },
  });

  const eventMap = new Map(registrations.map((r) => [r.id, r.event.name]));

  const countByEvent: Record<string, number> = {};
  for (const s of stats) {
    const eventName = eventMap.get(s.registrationId);
    if (eventName) {
      countByEvent[eventName] = (countByEvent[eventName] ?? 0) + s._count.id;
    }
  }

  const result = Object.entries(countByEvent).map(([eventName, count]) => ({
    eventName,
    _count: { checkIn: count },
  }));

  return NextResponse.json(result);
}