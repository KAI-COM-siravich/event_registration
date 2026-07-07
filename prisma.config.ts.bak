import "dotenv/config";
import { defineConfig } from "@prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma", // Path to your Prisma schema
  datasource: {
    url: process.env.DATABASE_URL!, // Main connection URL from environment variables
    shadowDatabaseUrl: process.env.DIRECT_URL, // Provides URL for migrations
  },
  migrations: {
    path: "./prisma/migrations", // Specify Prisma migrations folder
  },
});