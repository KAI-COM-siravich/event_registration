import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

const VALID_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CHECKEDIN",
  "CANCELLED",
] as const;

type RegistrationStatus = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body || typeof body !== "object" || !("status" in body)) {
    return NextResponse.json({ error: "'status' field is required" }, { status: 400 });
  }

  const status = (body as Record<string, unknown>).status;

  if (
    typeof status !== "string" ||
    !(VALID_STATUSES as readonly string[]).includes(status)
  ) {
    return NextResponse.json(
      { error: `status must be one of: ${VALID_STATUSES.join(", ")}` },
      { status: 400 }
    );
  }

  const registration = await prisma.registration.update({
    where: { id },
    data: { status: status as RegistrationStatus },
  });

  return NextResponse.json(registration);
}
