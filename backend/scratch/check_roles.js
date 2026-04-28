const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Roles found:', users.map(u => u.role));
  process.exit(0);
}

main();
