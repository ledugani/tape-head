import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Create test user if not exists
  const testUser = await prisma.user.upsert({
    where: { email: 'iamtest@test.com' },
    update: {},
    create: {
      email: 'iamtest@test.com',
      username: 'testuser',
      passwordHash: await bcrypt.hash('password1', 10),
      emailVerified: true
    }
  });
  console.log('Test user created/updated:', testUser.email);

  // Create test tape if not exists
  const testTape = await prisma.tape.upsert({
    where: { 
      title_year: {
        title: 'The Terminator',
        year: 1984
      }
    },
    update: {},
    create: {
      title: 'The Terminator',
      year: 1984,
      genre: 'Action',
      format: 'Clamshell',
      label: 'Orion Pictures',
      coverImage: 'https://example.com/terminator.jpg'
    }
  });
  console.log('Test tape created/updated:', testTape.title);

  // Create collection record
  const collection = await prisma.userCollection.upsert({
    where: {
      userId_tapeId: {
        userId: testUser.id,
        tapeId: testTape.id
      }
    },
    update: {},
    create: {
      userId: testUser.id,
      tapeId: testTape.id,
      condition: 'Good',
      notes: 'Test collection item'
    }
  });
  console.log('Collection record created/updated');

  // Create wantlist record
  const wantlist = await prisma.userWantlist.upsert({
    where: {
      userId_tapeId: {
        userId: testUser.id,
        tapeId: testTape.id
      }
    },
    update: {},
    create: {
      userId: testUser.id,
      tapeId: testTape.id,
      priority: 1,
      notes: 'Test wantlist item'
    }
  });
  console.log('Wantlist record created/updated');
}

main()
  .catch((e) => {
    console.error('Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 