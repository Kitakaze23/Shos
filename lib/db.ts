import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

// Connection pooling configuration
// Prisma uses connection pooling by default
// For production, configure DATABASE_URL with connection pooler:
// postgresql://user:password@host:5432/db?connection_limit=10&pool_timeout=20

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Graceful shutdown
if (typeof process !== "undefined") {
  process.on("beforeExit", async () => {
    await prisma.$disconnect()
  })
}
