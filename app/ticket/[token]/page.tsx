import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { QRCodeSVG } from "qrcode.react";
import { CalendarDays, MapPin, User, CheckCircle2 } from "lucide-react";

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border/50 bg-card shadow-2xl animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="bg-primary px-6 py-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/10 to-transparent"></div>
          <h1 className="relative text-2xl font-bold tracking-tight text-primary-foreground">
            {event.name}
          </h1>
          <p className="relative mt-2 text-primary-foreground/80 font-medium">
            Attendee Ticket
          </p>
        </div>

        {/* Details */}
        <div className="px-6 py-6 space-y-6 bg-card relative">
          
          <div className="flex justify-center -mt-12">
            <div className="bg-white p-4 rounded-2xl shadow-xl">
              <QRCodeSVG
                value={token}
                size={200}
                bgColor={"#ffffff"}
                fgColor={"#000000"}
                level={"H"}
                includeMargin={false}
              />
            </div>
          </div>

          <div className="text-center mt-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
              Registration Approved
            </div>
          </div>

          <div className="space-y-4 rounded-xl bg-muted/30 p-5">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[13px] text-muted-foreground">{user.company || "Guest"}</p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <CalendarDays className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Date</p>
                <p className="text-[13px] text-muted-foreground">
                  {event.date ? new Date(event.date).toLocaleDateString() : "TBA"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Location</p>
                <p className="text-[13px] text-muted-foreground">{event.location}</p>
              </div>
            </div>
          </div>

          <p className="text-center text-[13px] text-muted-foreground">
            Please present this QR code at the event entrance and booths.
          </p>
        </div>
      </div>
    </div>
  );
}
