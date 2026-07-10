import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, MapPin, User, CheckCircle2, Building2 } from "lucide-react";

export default async function TicketPage({
  params,
}: {
  params: { token: string };
}) {
  const { token } = params;

  const qrCode = await prisma.qRCode.findUnique({
    where: { token },
    include: {
      registration: {
        include: {
          customer: { include: { user: true } },
          event: true,
        },
      },
    },
  });

  if (!qrCode || !qrCode.registration) {
    notFound();
  }

  const { registration } = qrCode;
  const { event, customer } = registration;
  const { user } = customer;

  const fName = registration.firstName || user.firstName;
  const lName = registration.lastName || user.lastName;
  const email = registration.email || user.email;
  const company = registration.company || user.company;

  const fullName = [fName, lName].filter(Boolean).join(" ");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background linear-grid px-4 py-8 sm:py-12">
      {/* Apple Wallet-style card */}
      <div className="w-full max-w-[390px] overflow-hidden rounded-[2rem] shadow-[0_32px_80px_rgba(0,0,0,0.25)] animate-in zoom-in-95 fade-in duration-500">
        
        {/* Card header — gradient */}
        <div
          className="relative overflow-hidden px-6 py-8 text-white"
          style={{
            background: "linear-gradient(135deg, #0057b8 0%, #0071E3 50%, #5856D6 100%)",
          }}
        >
          {/* Decorative orbs */}
          <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10 blur-xl" />

          <div className="relative">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-white/60 mb-2">
              Event Ticket
            </p>
            <h1 className="text-2xl font-bold tracking-tight leading-tight mb-1">
              {event.name}
            </h1>
            <p className="text-[14px] text-white/70 font-medium">
              {event.date ? new Date(event.date).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              }) : "Date TBA"}
            </p>
          </div>

          {/* Status badge */}
          <div className="relative mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[12px] font-semibold text-white">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Approved
          </div>
        </div>

        {/* QR Code section */}
        <div className="bg-white dark:bg-zinc-900 px-6 py-8 flex flex-col items-center gap-6">
          {/* Large QR */}
          <div className="bg-white p-4 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.12)]">
            <QRCodeSVG
              value={token}
              size={220}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
              level={"H"}
              includeMargin={false}
            />
          </div>

          <p className="text-[12px] text-muted-foreground text-center font-mono tracking-wider">
            {token.slice(0, 8)}...{token.slice(-8)}
          </p>

          {/* Divider — perforated style */}
          <div className="w-full flex items-center gap-3">
            <div className="h-px flex-1 border-t border-dashed border-border" />
            <span className="text-[11px] text-muted-foreground font-medium uppercase tracking-widest">
              Attendee
            </span>
            <div className="h-px flex-1 border-t border-dashed border-border" />
          </div>

          {/* Attendee info */}
          <div className="w-full space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <User className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-foreground">{fullName}</p>
                <p className="text-[13px] text-muted-foreground">{email}</p>
              </div>
            </div>

            {company && (
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-[14px] text-foreground font-medium">{company}</p>
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[14px] text-foreground font-medium">{event.location}</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </div>
              <p className="text-[14px] text-foreground font-medium">
                {event.date ? new Date(event.date).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                }) : "Time TBA"}
              </p>
            </div>
          </div>

          <p className="text-[12px] text-muted-foreground text-center pt-2">
            Present this QR code at the entrance and booth terminals.
          </p>
        </div>
      </div>
    </div>
  );
}
