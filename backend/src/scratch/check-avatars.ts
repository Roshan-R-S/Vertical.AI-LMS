import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString: connectionString! });
const prisma = new PrismaClient({ adapter });

async function check() {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, avatar: true }
    });
    console.log('User Avatars in DB:', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error checking avatars:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();
