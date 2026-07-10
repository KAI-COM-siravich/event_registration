import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { sendEmailGraphAPI } from "@/lib/email";
import { logAuditAction } from "@/lib/auditLog";

const VALID_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CHECKEDIN",
  "CANCELLED",
] as const;

type RegistrationStatus = (typeof VALID_STATUSES)[number];

import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Admin can approve or reject registrations." }, { status: 403 });
    }
  } catch (error) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
    include: { customer: { include: { user: true } }, event: true },
  });

  await logAuditAction(`Updated Registration Status: ${registration.firstName} ${registration.lastName} (${registration.email}) - Status: ${status}`);

  if (status === "APPROVED") {
    // Generate QR Code if it doesn't exist
    const qrCode = await prisma.qRCode.upsert({
      where: { registrationId: id },
      create: { registrationId: id },
      update: {},
    });

    // Trigger n8n Webhook if configured
    try {
      const [n8nConfig, lineConfig, lineTemplate] = await Promise.all([
        prisma.systemConfig.findUnique({ where: { key: "N8N_WEBHOOK_URL" } }),
        prisma.systemConfig.findUnique({ where: { key: "LINE_OA_TOKEN" } }),
        prisma.systemConfig.findUnique({ where: { key: "LINE_APPROVAL_TEMPLATE" } }),
      ]);
      
      if (n8nConfig && n8nConfig.value) {
        await fetch(n8nConfig.value, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registration,
            qrToken: qrCode.token,
            action: "REGISTRATION_APPROVED"
          }),
        }).catch(err => console.error("Webhook trigger failed:", err));
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

      // Check for Line Account and send message
      const lineAccount = await prisma.lineAccount.findUnique({
        where: { userId: registration.customer.user.id }
      });

      if (lineAccount && lineConfig && lineConfig.value) {
        let textTemplate = lineTemplate?.value || "Congratulations! Your registration for {{EVENT_NAME}} has been approved. Your QR code token is: {{QR_TOKEN}}";
        textTemplate = textTemplate.replace(/\{\{EVENT_NAME\}\}/g, registration.event.name);
        textTemplate = textTemplate.replace(/\{\{QR_TOKEN\}\}/g, qrCode.token);

        const message = {
          to: lineAccount.lineUserId,
          messages: [
            {
              type: "text",
              text: textTemplate
            }
          ]
        };
        await fetch("https://api.line.me/v2/bot/message/push", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${lineConfig.value}`
          },
          body: JSON.stringify(message)
        }).catch(err => console.error("LINE push failed:", err));
      }
    } catch (e) {
      console.error("Error triggering workflows", e);
    }
  }

  return NextResponse.json(registration);
}
