/**
 * prisma.ts — Singleton PrismaClient for Prisma 7 (pg adapter)
 *
 * In Next.js, hot-reloading creates new module instances, which would spawn
 * a new connection pool on every change. Storing the client on `globalThis`
 * in dev prevents pool exhaustion.
 */

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

// 1. Create a connection pool using your environment variable
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// 2. Initialize the Prisma adapter
const adapter = new PrismaPg(pool as any);

// 3. Create the Prisma Client using that adapter
const prismaClientSingleton = () => {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
};

// 4. Prevent multiple instances during development (Hot Reloading)
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
