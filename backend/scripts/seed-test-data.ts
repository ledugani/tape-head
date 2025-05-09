import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create a test user if none exists
    const existingUser = await prisma.user.findFirst();
    let user = existingUser;

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('testpassword123', 10);
      user = await prisma.user.create({
        data: {
          username: 'testuser',
          email: 'test@example.com',
          passwordHash: hashedPassword,
        },
      });
      console.log('Created test user:', user.username);
    } else {
      console.log('Using existing user:', existingUser.username);
    }

    // Create a test tape if none exists
    const existingTape = await prisma.tape.findFirst();
    let tape = existingTape;

    if (!existingTape) {
      tape = await prisma.tape.create({
        data: {
          title: 'Back to the Future',
          year: 1985,
          genre: 'Science Fiction',
          format: 'VHS',
          label: 'Universal',
        },
      });
      console.log('Created test tape:', tape.title);
    } else {
      console.log('Using existing tape:', existingTape.title);
    }

  } catch (error) {
    console.error('Error seeding test data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 