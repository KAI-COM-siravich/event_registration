import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  const stats = await prisma.boothVisit.groupBy({
    by: ["boothId"],
    _count: true,
    ...(eventId ? { where: { booth: { eventId } } } : {}),
  });

  const booths = await prisma.booth.findMany({
    where: { id: { in: stats.map((s) => s.boothId) } },
    select: { id: true, name: true },
  });

  const boothMap = new Map(booths.map((b) => [b.id, b.name]));

  const result = stats.map((s) => ({
    ...s,
    boothName: boothMap.get(s.boothId) || s.boothId,
  }));

  return NextResponse.json(result);
}