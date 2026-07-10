import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";
import { BlacklistSchema } from "@/lib/validations";

export async function GET() {
  try {
    const list = await prisma.blacklist.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blacklist" }, { status: 500 });
  }
}

import { getServerSession } from "next-auth/next";
import { getAuthOptions } from "../auth/[...nextauth]/route";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if ((session?.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const validationResult = BlacklistSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.format() },
        { status: 400 }
      );
    }

    const { email, phone, company, reason } = validationResult.data;

    const newBlacklistId = await generateId("Blacklist", "ID_PREFIX_BLACKLIST", "BLK-");
    const newItem = await prisma.blacklist.create({
      data: {
        id: newBlacklistId,
        email: email || null,
        phone: phone || null,
        company: company || null,
        reason,
        active: true,
      },
    });

    return NextResponse.json(newItem);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create blacklist entry" }, { status: 500 });
  }
}
