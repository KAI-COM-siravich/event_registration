import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const events = await prisma.event.findMany({
    orderBy: { date: "asc" },
    select: { id: true, name: true, date: true, location: true },
  });
  return NextResponse.json(events);
}
