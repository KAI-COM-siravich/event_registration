import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { include: { user: true } },
      event: true,
    },
  });
  return NextResponse.json(registrations);
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const data = body as Record<string, unknown>;

  const firstName =
    typeof data.firstName === "string" ? data.firstName.trim() : "";
  const lastName =
    typeof data.lastName === "string" ? data.lastName.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim() : "";
  const eventId = typeof data.eventId === "string" ? data.eventId.trim() : "";
  const phone =
    typeof data.phone === "string" && data.phone.trim()
      ? data.phone.trim()
      : null;
  const company =
    typeof data.company === "string" && data.company.trim()
      ? data.company.trim()
      : null;

  if (!firstName || !lastName || !email || !eventId) {
    return NextResponse.json(
      { error: "firstName, lastName, email, and eventId are required" },
      { status: 400 }
    );
  }

  // Blacklist check
  const blacklistConditions: { email?: string; phone?: string }[] = [
    { email },
  ];
  if (phone) blacklistConditions.push({ phone });

  const blacklisted = await prisma.blacklist.findFirst({
    where: { active: true, OR: blacklistConditions },
  });

  if (blacklisted) {
    return NextResponse.json(
      { error: "Registration is not permitted for this contact" },
      { status: 403 }
    );
  }

  // Find or create User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: { email, firstName, lastName, phone, company },
    });
  }

  // Find or create Customer
  let customer = await prisma.customer.findUnique({
    where: { userId: user.id },
  });
  if (!customer) {
    customer = await prisma.customer.create({ data: { userId: user.id } });
  }

  // Check for duplicate registration
  const existing = await prisma.registration.findFirst({
    where: { customerId: customer.id, eventId },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Already registered for this event" },
      { status: 409 }
    );
  }

  const registration = await prisma.registration.create({
    data: { customerId: customer.id, eventId, status: "PENDING" },
    include: {
      customer: { include: { user: true } },
      event: true,
    },
  });

  return NextResponse.json(registration, { status: 201 });
}