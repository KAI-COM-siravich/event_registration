import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const [totalRegistrations, approvedRegistrations, totalCheckIns, totalRewards] =
    await Promise.all([
      prisma.registration.count(),
      prisma.registration.count({ where: { status: "APPROVED" } }),
      prisma.checkIn.count(),
      prisma.reward.count(),
    ]);

  return NextResponse.json({
    totalRegistrations,
    approvedRegistrations,
    totalCheckIns,
    totalRewards,
  });
}
