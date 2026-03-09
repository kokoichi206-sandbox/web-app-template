import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma";
import { serverEnv } from "@/shared/env/server-env";

// ref:
// https://www.prisma.io/docs/orm/more/help-and-troubleshooting/nextjs-help
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const adapter = new PrismaPg({
  connectionString: serverEnv.DATABASE_URL,
});

// eslint-disable-next-line @typescript-eslint/strict-boolean-expressions, @typescript-eslint/no-unnecessary-condition
export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// eslint-disable-next-line no-process-env
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
