import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { getAuthOptions } from "@/app/api/auth/[...nextauth]/route";

export async function logAuditAction(action: string) {
  try {
    const session = await getServerSession(await getAuthOptions());
    if (!session?.user?.email) return;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (user) {
      await prisma.auditLog.create({
        data: {
          userId: user.id,
          action,
        },
      });
    }
  } catch (error) {
    console.error("Failed to save audit log", error);
  }
}
