const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    include: { team: true }
  });
  
  console.log('--- USERS ---');
  users.forEach(u => {
    console.log(`ID: ${u.id} | Name: ${u.name} | Role: ${u.role} | Team: ${u.team ? u.team.name : 'NONE'} | TeamId: ${u.teamId}`);
  });
  
  const teams = await prisma.team.findMany();
  console.log('--- TEAMS ---');
  teams.forEach(t => {
    console.log(`ID: ${t.id} | Name: ${t.name}`);
  });
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(() => prisma.$disconnect());
