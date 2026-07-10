import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { getAuthOptions } from "../auth/[...nextauth]/route";

export async function GET() {
  try {
    const configs = await prisma.systemConfig.findMany();
    const result = configs.reduce((acc: Record<string, string>, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
    
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    
    if (typeof body !== "object" || !body) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const updates = Object.entries(body).map(async ([key, value]) => {
      if (typeof value === "string") {
        return prisma.systemConfig.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    });

    await Promise.all(updates);

    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
      });

      if (dbUser) {
        await prisma.auditLog.create({
          data: {
            userId: dbUser.id,
            action: "Updated system settings",
          },
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
