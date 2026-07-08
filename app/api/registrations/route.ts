import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";

export async function GET() {
  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      customer: { include: { user: true } },
      event: true,
    },
  });

  const blacklists = await prisma.blacklist.findMany({ where: { active: true } });

  const enriched = registrations.map((reg) => {
    const u = reg.customer.user;
    const match = blacklists.find(
      (b) =>
        (b.email && b.email.toLowerCase() === u.email.toLowerCase()) ||
        (b.phone && u.phone && b.phone === u.phone) ||
        (b.company && u.company && b.company.toLowerCase() === u.company.toLowerCase())
    );
    return {
      ...reg,
      blacklistWarning: match ? match.reason : null,
    };
  });

  return NextResponse.json(enriched);
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
  const jobPosition = typeof data.jobPosition === "string" ? data.jobPosition.trim() : null;
  const travelMethod = typeof data.travelMethod === "string" ? data.travelMethod.trim() : null;
  const needHotel = typeof data.needHotel === "string" ? data.needHotel.trim() : null;
  const salesRep = typeof data.salesRep === "string" ? data.salesRep.trim() : null;
  const plannedUpgrade = typeof data.plannedUpgrade === "string" ? data.plannedUpgrade.trim() : null;
  const projectByYear = typeof data.projectByYear === "string" ? data.projectByYear.trim() : null;
  const consent = data.consent === true || data.consent === "true";

  if (!firstName || !lastName || !email || !eventId) {
    return NextResponse.json(
      { error: "firstName, lastName, email, and eventId are required" },
      { status: 400 }
    );
  }

  // Blacklist matching is handled on the Admin Dashboard side.
  // We allow the registration to proceed so it can be reviewed.

  // Find or create User
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const newUserId = await generateId("User", "ID_PREFIX_USER", "USR-");
    user = await prisma.user.create({
      data: { id: newUserId, email, firstName, lastName, phone, company, jobPosition },
    });
  }

  // Find or create Customer
  let customer = await prisma.customer.findUnique({
    where: { userId: user.id },
  });
  if (!customer) {
    const newCustomerId = await generateId("Customer", "ID_PREFIX_CUSTOMER", "CUS-");
    customer = await prisma.customer.create({ data: { id: newCustomerId, userId: user.id } });
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

  // Fetch Auto-Approve config
  const autoApproveConfig = await prisma.systemConfig.findUnique({
    where: { key: "AUTO_APPROVE" },
  });
  const isAutoApprove = autoApproveConfig?.value === "true";
  const approvalStatus = isAutoApprove ? "APPROVED" : "PENDING";

  const newRegistrationId = await generateId("Registration", "ID_PREFIX_REGISTRATION", "REG-");
  const registration = await prisma.registration.create({
    data: {
      id: newRegistrationId,
      customerId: customer.id,
      eventId,
      status: approvalStatus,
      travelMethod,
      needHotel,
      salesRep,
      plannedUpgrade,
      projectByYear,
      consent,
    },
    include: {
      customer: { include: { user: true } },
      event: true,
    },
  });

  if (isAutoApprove) {
    const newQrCodeId = await generateId("QRCode", "ID_PREFIX_QRCODE", "QR-");
    const qrCode = await prisma.qRCode.create({ data: { id: newQrCodeId, registrationId: registration.id } });
    try {
      const [n8nConfig, lineConfig, lineTemplate] = await Promise.all([
        prisma.systemConfig.findUnique({ where: { key: "N8N_WEBHOOK_URL" } }),
        prisma.systemConfig.findUnique({ where: { key: "LINE_OA_TOKEN" } }),
        prisma.systemConfig.findUnique({ where: { key: "LINE_APPROVAL_TEMPLATE" } }),
      ]);
      
      if (n8nConfig && n8nConfig.value) {
        fetch(n8nConfig.value, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registration, qrToken: qrCode.token, action: "REGISTRATION_APPROVED" }),
        }).catch(() => {});
      }

      const lineAccount = await prisma.lineAccount.findUnique({
        where: { userId: registration.customer.user.id }
      });

      if (lineAccount && lineConfig && lineConfig.value) {
        let textTemplate = lineTemplate?.value || "Congratulations! Your registration for {{EVENT_NAME}} has been approved. Your QR code token is: {{QR_TOKEN}}";
        textTemplate = textTemplate.replace(/\{\{EVENT_NAME\}\}/g, registration.event.name);
        textTemplate = textTemplate.replace(/\{\{QR_TOKEN\}\}/g, qrCode.token);

        fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lineConfig.value}`
          },
          body: JSON.stringify({ to: lineAccount.lineUserId, messages: [{ type: "text", text: textTemplate }] })
        }).catch(() => {});
      }
    } catch (e) {}
  }

  return NextResponse.json(registration, { status: 201 });
}