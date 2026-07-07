import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const rewards = await prisma.reward.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { include: { user: true } },
      event: true,
    },
  });
  return NextResponse.json(rewards);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  if (typeof data.customerId !== "string" || typeof data.eventId !== "string") {
    return NextResponse.json(
      { error: "customerId and eventId are required strings" },
      { status: 400 }
    );
  }

  const existing = await prisma.reward.findFirst({
    where: { customerId: data.customerId, eventId: data.eventId },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Reward already granted for this customer and event" },
      { status: 409 }
    );
  }

  const reward = await prisma.reward.create({
    data: { customerId: data.customerId, eventId: data.eventId },
    include: {
      customer: { include: { user: true } },
      event: true,
    },
  });

  return NextResponse.json(reward, { status: 201 });
}
