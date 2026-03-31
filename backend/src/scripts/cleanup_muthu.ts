import { prisma } from '../prisma';

async function main() {
  console.log('🧹 Starting cleanup for users named "Muthu" or "muthu"...');

  // 1. Find the users
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { name: 'Muthu' },
        { name: 'muthu' }
      ]
    }
  });

  if (users.length === 0) {
    console.log('❌ No users found with name "Muthu" or "muthu".');
    return;
  }

  const userIds = users.map(u => u.id);
  const userEmails = users.map(u => u.email);

  console.log(`🔍 Found ${users.length} users: ${userEmails.join(', ')}`);

  // 2. Delete leads assigned to these users
  const deletedLeads = await prisma.lead.deleteMany({
    where: {
      assignedToId: { in: userIds }
    }
  });
  console.log(`🗑️  Deleted ${deletedLeads.count} leads.`);

  // 3. Delete activities created by these users
  const deletedActivities = await prisma.activity.deleteMany({
    where: {
      createdBy: { in: userIds }
    }
  });
  console.log(`🗑️  Deleted ${deletedActivities.count} activities.`);

  // 4. Delete registration requests for these emails
  const deletedRequests = await prisma.registrationRequest.deleteMany({
    where: {
      email: { in: userEmails }
    }
  });
  console.log(`🗑️  Deleted ${deletedRequests.count} registration requests.`);

  // 5. Delete the users
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { in: userIds }
    }
  });
  console.log(`✅ Successfully deleted ${deletedUsers.count} users.`);
}

main()
  .catch((e) => {
    console.error('❌ CLEANUP FAILED:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
