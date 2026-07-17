import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
  const session = await getServerSession(await getAuthOptions());
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const teams = await prisma.team.findMany({
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isHeadStaff: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(teams);
  } catch (error) {
    console.error("Failed to fetch teams", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(await getAuthOptions());
  if ((session?.user as any)?.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { name, members } = body; // members = array of { userId: string, isHead: boolean }

    if (!name) {
      return NextResponse.json({ error: "Team name is required" }, { status: 400 });
    }

    const newTeam = await prisma.$transaction(async (tx) => {
      // Create the team
      const team = await tx.team.create({
        data: { name },
      });

      // Update members if provided
      if (members && Array.isArray(members)) {
        for (const member of members) {
          await tx.user.update({
            where: { id: member.userId },
            data: {
              teamId: team.id,
              isHeadStaff: member.isHead || false,
            }
          });
        }
      }

      return await tx.team.findUnique({
        where: { id: team.id },
        include: { users: true }
      });
    });

    return NextResponse.json(newTeam, { status: 201 });
  } catch (error) {
    console.error("Failed to create team", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
