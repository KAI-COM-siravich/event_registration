import NextAuth from "next-auth";
import AzureADProvider from "next-auth/providers/azure-ad";
import prisma from "@/lib/prisma";
import { generateId } from "@/lib/idGenerator";

const handler = NextAuth({
  providers: [
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
      tenantId: process.env.AZURE_AD_TENANT_ID || "",
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
        return "/?error=PendingApproval";
      }

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
  pages: {
    signIn: "/",
    error: "/?error=AccessDenied",
  },
  session: {
    strategy: "jwt",
  },
});

export { handler as GET, handler as POST };
