import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  // CheckIn is a relation on Registration, not a scalar — groupBy cannot count it.
  // Instead, query CheckIn directly and group by the eventId via the registration relation.
  const stats = await prisma.checkIn.groupBy({
    by: ["registrationId"],
    _count: {
      id: true,
    },
  });

  // Join with registrations to get eventId
  const registrations = await prisma.registration.findMany({
    where: { id: { in: stats.map((s) => s.registrationId) } },
    select: { id: true, eventId: true },
  });

  const eventMap = new Map(registrations.map((r) => [r.id, r.eventId]));

  const countByEvent: Record<string, number> = {};
  for (const s of stats) {
    const eventId = eventMap.get(s.registrationId);
    if (eventId) {
      countByEvent[eventId] = (countByEvent[eventId] ?? 0) + s._count.id;
    }
  }

  const result = Object.entries(countByEvent).map(([eventId, count]) => ({
    eventId,
    _count: { checkIn: count },
  }));

  return NextResponse.json(result);
}