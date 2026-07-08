import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");

  const [totalRegistrations, approvedRegistrations, totalCheckIns, totalRewards, totalBooths] =
    await Promise.all([
      prisma.registration.count(eventId ? { where: { eventId } } : undefined),
      prisma.registration.count({ where: { status: "APPROVED", ...(eventId ? { eventId } : {}) } }),
      prisma.checkIn.count(eventId ? { where: { registration: { eventId } } } : undefined),
      prisma.reward.count(eventId ? { where: { eventId } } : undefined),
      prisma.booth.count(eventId ? { where: { eventId } } : undefined),
    ]);

  return NextResponse.json({
    totalRegistrations,
    approvedRegistrations,
    totalCheckIns,
    totalRewards,
    totalBooths,
  });
}
