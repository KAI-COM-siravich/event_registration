import NextAuth, { AuthOptions } from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";
import { NextRequest } from "next/server";

async function logAuditAction(userId: string, action: string) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
      },
    });
  } catch (error) {
    console.error("Failed to save audit log", error);
  }
}

export async function getAuthOptions(): Promise<AuthOptions> {
  let settings: { key: string, value: string }[] = [];
  try {
    settings = await prisma.systemConfig.findMany({
      where: {
        key: {
          in: ["AZURE_AD_CLIENT_ID", "AZURE_AD_CLIENT_SECRET", "AZURE_AD_TENANT_ID"]
        }
      }
    });
  } catch (err) {
    console.error("Failed to load auth settings", err);
  }

  const config = settings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {} as Record<string, string>);

  return {
    providers: [
      AzureADProvider({
        clientId: config.AZURE_AD_CLIENT_ID || process.env.AZURE_AD_CLIENT_ID || "",
        clientSecret: config.AZURE_AD_CLIENT_SECRET || process.env.AZURE_AD_CLIENT_SECRET || "",
        tenantId: config.AZURE_AD_TENANT_ID || process.env.AZURE_AD_TENANT_ID || "",
      }),
    ],
    callbacks: {
      async signIn({ user }) {
        if (!user.email) return false;

        // Find user in database
        let dbUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (!dbUser) {
          // Check if there are any ADMIN or STAFF users
          const adminOrStaffCount = await prisma.user.count({
            where: {
              role: { in: ["ADMIN", "STAFF"] }
            }
          });
          
          const isFirstUser = adminOrStaffCount === 0;

          // Create new user if they don't exist
          const newUserId = await generateId("User", "ID_PREFIX_USER", "USR-");
          dbUser = await prisma.user.create({
            data: {
              id: newUserId,
              email: user.email,
              firstName: user.name?.split(" ")[0] || "New",
              lastName: user.name?.split(" ").slice(1).join(" ") || "User",
              role: isFirstUser ? "ADMIN" : "STAFF",
              status: isFirstUser ? "APPROVED" : "PENDING",
            },
          });
        }

        // Deny access if the user is not approved
        if (dbUser.status !== "APPROVED") {
          await logAuditAction(dbUser.id, "Sign in denied (pending approval)");
          return "/?error=PendingApproval";
        }

        await logAuditAction(dbUser.id, "Sign in");

        // @ts-ignore
        user.role = dbUser.role;
        return true;
      },
      async jwt({ token, user }) {
        // @ts-ignore
        if (user?.role) token.role = user.role;
        return token;
      },
      async session({ session, token }) {
        // @ts-ignore
        if (token?.role && session.user) session.user.role = token.role;
        return session;
      }
    },
    events: {
      async signOut(message) {
        const email = message?.token?.email || message?.session?.user?.email;
        if (!email) return;

        try {
          const dbUser = await prisma.user.findUnique({ where: { email } });
          if (dbUser) {
            await logAuditAction(dbUser.id, "Sign out");
          }
        } catch (error) {
          console.error("Failed to save sign-out audit log", error);
        }
      },
    },
    pages: {
      signIn: "/",
      error: "/?error=AccessDenied",
    },
    session: {
      strategy: "jwt",
    },
  };
}

export async function GET(req: NextRequest, ctx: any) {
  return NextAuth(await getAuthOptions())(req, ctx);
}

export async function POST(req: NextRequest, ctx: any) {
  return NextAuth(await getAuthOptions())(req, ctx);
}
