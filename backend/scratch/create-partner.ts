import { prisma } from '../src/prisma';
import bcrypt from 'bcryptjs';

async function createPartner() {
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'partner@vertical.ai' },
    update: {},
    create: {
      email: 'partner@vertical.ai',
      name: 'Channel Partner',
      passwordHash,
      role: 'CHANNEL_PARTNER',
      isActive: true,
    },
  });
  
  console.log('Channel Partner created:', user.email);
  process.exit(0);
}

createPartner().catch(err => {
  console.error(err);
  process.exit(1);
});
