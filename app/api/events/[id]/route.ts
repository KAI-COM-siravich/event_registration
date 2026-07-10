import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/auditLog";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Admin can edit events." }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();
    
    const event = await prisma.event.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description || null,
        date: new Date(data.date),
        location: data.location,
      },
    });
    
    await logAuditAction(`Updated Event: ${event.name} (${event.id})`);
    
    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Admin can delete events." }, { status: 403 });
    }

    const { id } = await params;
    
    const event = await prisma.event.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    
    await logAuditAction(`Deleted Event: ${event.name} (${id})`);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Cannot delete event. It may have associated booths or registrations." },
      { status: 400 }
    );
  }
}
