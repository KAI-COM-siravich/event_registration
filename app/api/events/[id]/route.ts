import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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
    const { id } = await params;
    
    await prisma.event.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Cannot delete event. It may have associated booths or registrations." },
      { status: 400 }
    );
  }
}
