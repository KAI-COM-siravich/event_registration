import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";

export async function GET() {
  try {
    const list = await prisma.blacklist.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(list);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch blacklist" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, company, reason } = body;

    if (!reason) {
      return NextResponse.json({ error: "Reason is required" }, { status: 400 });
    }
    
    if (!email && !phone && !company) {
      return NextResponse.json({ error: "At least one condition (email, phone, company) is required" }, { status: 400 });
    }

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
