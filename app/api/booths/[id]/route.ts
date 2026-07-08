import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    const { id } = await params;
    
    await prisma.booth.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Cannot delete booth. It may have associated visits." },
      { status: 400 }
    );
  }
}
