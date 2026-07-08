import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  const stats = await prisma.reward.groupBy({
    by: ["eventId"],
    _count: true,
    ...(eventId ? { where: { eventId } } : {}),
  });

  const events = await prisma.event.findMany({
    where: { id: { in: stats.map((s) => s.eventId) } },
    select: { id: true, name: true },
  });

  const eventMap = new Map(events.map((e) => [e.id, e.name]));

  const result = stats.map((s) => ({
    ...s,
    eventName: eventMap.get(s.eventId) || s.eventId,
  }));

  return NextResponse.json(result);
}