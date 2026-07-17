import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(await getAuthOptions());
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const { name, members } = body;

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const updatedTeam = await prisma.$transaction(async (tx) => {
      const team = await tx.team.update({
        where: { id },
        data: { name },
      });

      if (members && Array.isArray(members)) {
        // Clear existing members from this team
        await tx.user.updateMany({
          where: { teamId: id },
          data: { teamId: null, isHeadStaff: false },
        });

        // Add new members
        for (const member of members) {
          await tx.user.update({
            where: { id: member.userId },
            data: {
              teamId: id,
              isHeadStaff: member.isHead || false,
            }
          });
        }
      }

      return await tx.team.findUnique({
        where: { id },
        include: { users: true }
      });
    });

    return NextResponse.json(updatedTeam);
  } catch (error) {
    console.error("Failed to update team", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(await getAuthOptions());
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { id } = await params;
    
    await prisma.$transaction(async (tx) => {
      // Unlink users from team
      await tx.user.updateMany({
        where: { teamId: id },
        data: { teamId: null, isHeadStaff: false },
      });

      // Delete the team
      await tx.team.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete team", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
