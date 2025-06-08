import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyTestData() {
  // Check test user
  const testUser = await prisma.user.findUnique({
    where: { email: 'iamtest@test.com' },
    include: {
      collections: {
        include: { tape: true }
      },
      wantlist: {
        include: { tape: true }
      }
    }
  });

  console.log('\n=== Test User ===');
  if (testUser) {
    console.log(`Found user: ${testUser.email}`);
    console.log(`Collections: ${testUser.collections.length} items`);
    testUser.collections.forEach(c => {
      console.log(`- ${c.tape.title} (${c.condition})`);
    });
    console.log(`\nWantlist: ${testUser.wantlist.length} items`);
    testUser.wantlist.forEach(w => {
      console.log(`- ${w.tape.title} (Priority: ${w.priority})`);
    });
  } else {
    console.log('Test user not found!');
  }
}

verifyTestData()
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 