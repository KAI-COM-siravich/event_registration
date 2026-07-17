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
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["STAFF", "ADMIN"] }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        teamId: true,
        isHeadStaff: true,
        team: {
          select: { name: true }
        }
      },
      orderBy: { firstName: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    console.error("Failed to fetch all users", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
