import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings save error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
