import { prisma } from '../prisma';

const searchId = 'cmocsuvuv00160sn0mf0iy869';

async function main() {
  const leads = await prisma.lead.findUnique({
    where: { id: searchId }
  });
  if (leads) {
    console.log(`Match found in Lead:`);
    console.log(JSON.stringify(leads, null, 2));
    return;
  }

  const users = await prisma.user.findUnique({
    where: { id: searchId }
  });
  if (users) {
    console.log(`Match found in User:`);
    console.log(JSON.stringify(users, null, 2));
    return;
  }

  const clients = await prisma.client.findUnique({
    where: { id: searchId }
  });
  if (clients) {
    console.log(`Match found in Client:`);
    console.log(JSON.stringify(clients, null, 2));
    return;
  }

  console.log('No match found in common models.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
