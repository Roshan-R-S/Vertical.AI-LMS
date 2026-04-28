import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Checking Channel Partner users...');

  // Check existing CP users
  const cpUsers = await prisma.user.findMany({
    where: { role: 'CHANNEL_PARTNER' },
    select: { id: true, name: true, email: true, isActive: true, isPending: true }
  });

  console.log('Existing CP users:', cpUsers);

  if (cpUsers.length === 0) {
    console.log('Creating test CP user...');
    
    const hash = await bcrypt.hash('Test@123', 10);
    
    const cpUser = await prisma.user.create({
      data: {
        name: 'Test Channel Partner',
        email: 'cp@test.com',
        passwordHash: hash,
        role: 'CHANNEL_PARTNER',
        avatar: 'TCP',
        isActive: true,
        isPending: false,
        companyName: 'Test Company',
      }
    });
    
    console.log('Created CP user:', cpUser);
    console.log('Login credentials: cp@test.com / Test@123');
  } else {
    // Activate any pending CP users for testing
    const pendingUsers = cpUsers.filter(u => u.isPending || !u.isActive);
    if (pendingUsers.length > 0) {
      console.log('Activating pending CP users...');
      for (const user of pendingUsers) {
        await prisma.user.update({
          where: { id: user.id },
          data: { isActive: true, isPending: false }
        });
        console.log(`Activated user: ${user.email}`);
      }
    }
  }

  console.log('Done!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());