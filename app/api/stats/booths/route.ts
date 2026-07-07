import { NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";

export async function GET() {
  const stats = await prisma.boothVisit.groupBy({
    by: ["boothId"],
    _count: true,
  });
  return NextResponse.json(stats);
}