import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: boothId } = await params;

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
    return NextResponse.json({ error: "token must be a string" }, { status: 400 });
  }

  // Find QR code and associated Registration
  const qrCode = await prisma.qRCode.findUnique({
    where: { token: token.trim() },
    include: {
      registration: {
        include: {
          customer: { include: { user: true } },
        },
      },
    },
  });

  if (!qrCode) {
    return NextResponse.json({ error: "QR code not found" }, { status: 404 });
  }

  const { registration } = qrCode;

  // Validate Booth exists
  const booth = await prisma.booth.findUnique({
    where: { id: boothId },
  });

  if (!booth) {
    return NextResponse.json({ error: "Booth not found" }, { status: 404 });
  }

  // Ensure registration is checked in (or at least approved)
  if (registration.status !== "CHECKEDIN" && registration.status !== "APPROVED") {
    return NextResponse.json(
      { error: `Registration status is ${registration.status}. Cannot record visit.` },
      { status: 400 }
    );
  }

  // Create or retrieve Booth Visit
  try {
    // Check if already visited
    const existingVisit = await prisma.boothVisit.findUnique({
      where: {
        unique_booth_visit: {
          boothId,
          customerId: registration.customerId,
        },
      },
    });

    if (existingVisit) {
      return NextResponse.json({ error: "Attendee already visited this booth" }, { status: 409 });
    }

    const newBoothVisitId = await generateId("BoothVisit", "ID_PREFIX_BOOTHVISIT", "BTV-");
    const visit = await prisma.boothVisit.create({
      data: {
        id: newBoothVisitId,
        boothId,
        customerId: registration.customerId,
      },
    });

    const user = registration.customer.user;
    const fName = registration.firstName || user?.firstName;
    const lName = registration.lastName || user?.lastName;
    const email = registration.email || user?.email;
    return NextResponse.json({
      success: true,
      visit,
      customer: {
        name: [fName, lName].filter(Boolean).join(" ") || "Unknown",
        email: email ?? "",
      },
    });
  } catch (error) {
    console.error("Booth scan error:", error);
    return NextResponse.json({ error: "Failed to record booth visit" }, { status: 500 });
  }
}
