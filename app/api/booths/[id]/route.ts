import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/auditLog";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booth = await prisma.booth.findUnique({
      where: { id },
    });
    if (!booth) {
      return NextResponse.json({ error: "Booth not found" }, { status: 404 });
    }
    return NextResponse.json(booth);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch booth" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Admin can edit booths." }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();
    
    const booth = await prisma.booth.update({
      where: { id },
      data: {
        name: data.name,
        eventId: data.eventId,
      },
      include: {
        event: { select: { name: true } }
      }
    });

    await logAuditAction(`Updated Booth: ${booth.name} (${booth.id})`);

    return NextResponse.json(booth);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update booth" },
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
      return NextResponse.json({ error: "Forbidden: Only Admin can delete booths." }, { status: 403 });
    }

    const { id } = await params;
    
    const booth = await prisma.booth.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    
    await logAuditAction(`Deleted Booth: ${booth.name} (${id})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Cannot delete booth. It may have associated visits." },
      { status: 400 }
    );
  }
}
