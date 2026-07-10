import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";
import { sendEmailGraphAPI } from "@/lib/email";
import { RegistrationSchema } from "@/lib/validations";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);
  const skip = (page - 1) * limit;

  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "ALL";
  const eventId = searchParams.get("eventId") || "";

  const whereClause: any = {};
  if (status !== "ALL") {
    whereClause.status = status;
  }
  if (eventId) {
    whereClause.eventId = eventId;
  }
  if (search) {
    whereClause.OR = [
      { customer: { user: { email: { contains: search, mode: "insensitive" } } } },
      { customer: { user: { firstName: { contains: search, mode: "insensitive" } } } },
      { customer: { user: { lastName: { contains: search, mode: "insensitive" } } } },
      { event: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [registrations, total, allStatuses] = await Promise.all([
    prisma.registration.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        customer: { include: { user: true } },
        event: true,
      },
    }),
    prisma.registration.count({ where: whereClause }),
    prisma.registration.groupBy({
      by: ["status"],
      _count: { status: true },
      where: eventId ? { eventId } : undefined,
    }),
  ]);

  const statusCounts: Record<string, number> = { ALL: 0 };
  allStatuses.forEach(s => {
    statusCounts[s.status] = s._count.status;
    statusCounts.ALL += s._count.status;
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

  return NextResponse.json({
    items: enriched,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    statusCounts,
  });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const validationResult = RegistrationSchema.safeParse(body);
  if (!validationResult.success) {
    return NextResponse.json(
      { error: "Validation failed", details: validationResult.error.format() },
      { status: 400 }
    );
  }

  const data = validationResult.data;
  const { firstName, lastName, email, eventId, phone, company, jobPosition, travelMethod, needHotel, salesRep, plannedUpgrade, projectByYear, consent } = data;

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
      firstName,
      lastName,
      email,
      phone,
      company,
      jobPosition,
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

      // Send Email Notification
      const emailSubject = `Registration Approved: ${registration.event.name}`;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #f97316;">Congratulations, ${registration.firstName}!</h2>
          <p>Your registration for <strong>${registration.event.name}</strong> has been approved.</p>
          <p>Your unique QR Code token is: <strong style="background: #f1f5f9; padding: 5px 10px; border-radius: 5px;">${qrCode.token}</strong></p>
          <p>Please present this QR code at the entrance and booth terminals during the event.</p>
          <br/>
          <p style="font-size: 12px; color: #64748b;">This is an automated message, please do not reply.</p>
        </div>
      `;
      sendEmailGraphAPI(registration.email, emailSubject, emailHtml).catch(() => {});

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