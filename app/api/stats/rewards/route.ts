import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  const stats = await prisma.reward.groupBy({
    by: ["eventId"],
    _count: true,
  });
  return NextResponse.json(stats);
}