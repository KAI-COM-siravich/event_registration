import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("token" in body) || !("eventId" in body)) {
    return NextResponse.json({ error: "'token' and 'eventId' are required" }, { status: 400 });
  }

  const token = (body as Record<string, unknown>).token;
  const eventId = (body as Record<string, unknown>).eventId;

  if (typeof token !== "string" || !token.trim() || typeof eventId !== "string" || !eventId.trim()) {
    return NextResponse.json({ error: "token and eventId must be valid strings" }, { status: 400 });
  }

  // Find QR code and associated Registration
  const qrCode = await prisma.qRCode.findUnique({
    where: { token: token.trim() },
    include: {
      registration: {
        include: {
          customer: { include: { user: true } },
          event: true,
        },
      },
    },
  });

  if (!qrCode) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }

  const { registration } = qrCode;

  if (registration.eventId !== eventId) {
    return NextResponse.json(
      { error: `This attendee is registered for ${registration.event.name}, not the selected event.` },
      { status: 400 }
    );
  }

  if (registration.status !== "CHECKEDIN") {
    return NextResponse.json(
      { error: `Registration status is ${registration.status}. Attendee must check-in first.` },
      { status: 400 }
    );
  }

  // Fetch Reward Configs
  const minBoothsConfig = await prisma.systemConfig.findUnique({
    where: { key: "MIN_BOOTH_VISITS_FOR_REWARD" },
  });
  const minBoothsRequired = parseInt(minBoothsConfig?.value || "0", 10);

  if (minBoothsRequired > 0) {
    const boothVisitsCount = await prisma.boothVisit.count({
      where: { customerId: registration.customerId },
    });
    
    if (boothVisitsCount < minBoothsRequired) {
      return NextResponse.json(
        { error: `Attendee must visit at least ${minBoothsRequired} booths. Current: ${boothVisitsCount}` },
        { status: 400 }
      );
    }
  }

  // Check if reward is already claimed for this event by this customer
  const existingReward = await prisma.reward.findFirst({
    where: {
      customerId: registration.customerId,
      eventId: eventId,
    },
  });

  if (existingReward) {
    return NextResponse.json({ error: "Attendee has already claimed a reward for this event." }, { status: 409 });
  }

  // Create Reward
  try {
    const newRewardId = await generateId("Reward", "ID_PREFIX_REWARD", "RWD-");
    const reward = await prisma.reward.create({
      data: {
        id: newRewardId,
        customerId: registration.customerId,
        eventId: eventId,
      },
    });

    const user = registration.customer.user;
    return NextResponse.json({
      success: true,
      reward,
      customer: {
        name: [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unknown",
        email: user?.email ?? "",
      },
    });
  } catch (error) {
    console.error("Reward claim error:", error);
    return NextResponse.json({ error: "Failed to claim reward" }, { status: 500 });
  }
}
