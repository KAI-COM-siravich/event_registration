import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import prisma from "@/lib/prisma";
import { logAuditAction } from "@/lib/auditLog";
import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const adminStaffRoles: Role[] = ["STAFF", "ADMIN"];
    const where = { role: { in: adminStaffRoles } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      items: users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, role, status } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(role && { role }),
        ...(status && { status }),
      },
    });

    await logAuditAction(`Updated User: ${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email}) - Role: ${updatedUser.role}, Status: ${updatedUser.status}`);

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
