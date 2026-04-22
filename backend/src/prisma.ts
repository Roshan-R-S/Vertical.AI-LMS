import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { config } from './config';

const adapter = new PrismaPg({ connectionString: config.databaseUrl! });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter, log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
