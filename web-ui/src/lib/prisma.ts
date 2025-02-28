import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function cleanUpDatabase() {
    try {
        console.log("Cleaning up database...");

        // Example: Remove all participants when the server restarts
        await prisma.people.deleteMany();
        await prisma.peopleWaiting.deleteMany();

        console.log("Database cleanup completed.");
    } catch (error) {
        console.error("Error cleaning up database:", error);
    }
}