import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  const stats = await prisma.registration.groupBy({
    by: ["eventId"],
    _count: {
      checkIn: true,
    },
  });
  return NextResponse.json(stats);
}