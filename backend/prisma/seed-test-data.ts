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

  // Create test box set
  const testBoxSet = await prisma.boxSet.upsert({
    where: { id: 1 },
    update: {},
    create: {
      title: 'Star Wars Original Trilogy',
      year: 1995,
      label: '20th Century Fox',
      coverImage: '/images/placeholder-vhs.svg',
      description: 'The complete Star Wars Original Trilogy on VHS, featuring A New Hope, The Empire Strikes Back, and Return of the Jedi.'
    }
  });
  console.log('Test box set created/updated:', testBoxSet.title);

  // Create test tapes in the box set
  const tapes = [
    {
      title: 'Star Wars: A New Hope',
      year: 1977,
      genre: 'Science Fiction',
      format: 'VHS',
      label: '20th Century Fox',
      coverImage: 'https://example.com/new-hope.jpg',
      boxSetId: testBoxSet.id
    },
    {
      title: 'Star Wars: The Empire Strikes Back',
      year: 1980,
      genre: 'Science Fiction',
      format: 'VHS',
      label: '20th Century Fox',
      coverImage: 'https://example.com/empire.jpg',
      boxSetId: testBoxSet.id
    },
    {
      title: 'Star Wars: Return of the Jedi',
      year: 1983,
      genre: 'Science Fiction',
      format: 'VHS',
      label: '20th Century Fox',
      coverImage: 'https://example.com/jedi.jpg',
      boxSetId: testBoxSet.id
    }
  ];

  for (const tapeData of tapes) {
    const tape = await prisma.tape.upsert({
      where: { 
        title_year: {
          title: tapeData.title,
          year: tapeData.year
        }
      },
      update: { boxSetId: tapeData.boxSetId },
      create: tapeData
    });
    console.log('Test tape created/updated:', tape.title);

    // Add first tape to user's collection
    if (tape.title === 'Star Wars: A New Hope') {
      const collection = await prisma.userCollection.upsert({
        where: {
          userId_tapeId: {
            userId: testUser.id,
            tapeId: tape.id
          }
        },
        update: {},
        create: {
          userId: testUser.id,
          tapeId: tape.id,
          condition: 'Good',
          notes: 'Original box set release'
        }
      });
      console.log('Collection record created/updated for:', tape.title);
    }
  }
}

main()
  .catch((e) => {
    console.error('Error seeding test data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 