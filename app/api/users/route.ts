import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth/next";

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    // In production, verify session.user.role === 'ADMIN'

    // Fetch all users who are not CUSTOMER
    const users = await prisma.user.findMany({
      where: {
        role: { in: ["STAFF", "ADMIN"] },
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession();
    // In production, verify session.user.role === 'ADMIN'

    const { userId, role, status } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
