import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";

import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  const session = await getServerSession(await getAuthOptions());
  const role = (session?.user as any)?.role;
  if (role === 'CUSTOMER' || !role) {
    return NextResponse.json({ error: "Forbidden: Only staff can perform check-ins." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("token" in body)) {
    return NextResponse.json({ error: "'token' is required" }, { status: 400 });
  }

  const token = (body as Record<string, unknown>).token;
  if (typeof token !== "string" || !token.trim()) {
    return NextResponse.json(
      { error: "token must be a non-empty string" },
      { status: 400 }
    );
  }

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

  if (registration.status !== "APPROVED") {
    return NextResponse.json(
      {
        error: `Registration is ${registration.status.toLowerCase()}. Only APPROVED registrations can check in.`,
      },
      { status: 400 }
    );
  }

  const existing = await prisma.checkIn.findUnique({
    where: { registrationId: registration.id },
  });
  if (existing) {
    return NextResponse.json({ error: "Already checked in" }, { status: 409 });
  }

  const newCheckInId = await generateId("CheckIn", "ID_PREFIX_CHECKIN", "CHK-");
  await prisma.$transaction([
    prisma.checkIn.create({ data: { id: newCheckInId, registrationId: registration.id } }),
    prisma.registration.update({
      where: { id: registration.id },
      data: { status: "CHECKEDIN" },
    }),
  ]);

  const user = registration.customer?.user;
  const fName = registration.firstName || user?.firstName;
  const lName = registration.lastName || user?.lastName;
  const email = registration.email || user?.email;
  return NextResponse.json({
    success: true,
    customer: {
      name: [fName, lName].filter(Boolean).join(" ") || "Unknown",
      email: email ?? "",
    },
    event: registration.event?.name ?? "",
  });
}

export async function GET() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkIns = await prisma.checkIn.findMany({
    where: { createdAt: { gte: today } },
    orderBy: { createdAt: "desc" },
    include: {
      registration: {
        include: {
          customer: { include: { user: true } },
          event: true,
        },
      },
    },
  });

  return NextResponse.json(checkIns);
}
