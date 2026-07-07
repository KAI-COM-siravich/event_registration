import { NextResponse } from "next/server";
import prisma from "../../../lib/prisma";

export async function GET() {
  const registrations = await prisma.registration.findMany({
    include: {
      customer: true,
      event: true,
    },
  });
  return NextResponse.json(registrations);
}