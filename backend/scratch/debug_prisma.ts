import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const user = await prisma.user.findFirst({
      include: { team: true }
    });
    console.log('User fetched successfully:', user ? 'Yes' : 'No');
    if (user) {
      console.log('User fields:', Object.keys(user));
    }
  } catch (err: any) {
    console.error('Error fetching user:', err.message);
    console.error('Stack:', err.stack);
  } finally {
    await prisma.$disconnect();
  }
}

check();
