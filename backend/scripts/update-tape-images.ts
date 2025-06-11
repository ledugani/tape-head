import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Update all tapes to use the placeholder image
    const updatedTapes = await prisma.tape.updateMany({
      where: {
        OR: [
          { coverImage: { contains: 'amazon.com' } },
          { coverImage: { contains: 'example.com' } },
          { coverImage: null }
        ]
      },
      data: {
        coverImage: '/images/placeholder-vhs.svg'
      }
    });

    console.log(`Updated ${updatedTapes.count} tapes to use placeholder image`);

    // Verify the update
    const tapes = await prisma.tape.findMany({
      select: {
        id: true,
        title: true,
        coverImage: true
      }
    });

    console.log('\nVerifying tape images:');
    tapes.forEach(tape => {
      console.log(`${tape.title}: ${tape.coverImage}`);
    });

  } catch (error) {
    console.error('Error updating tape images:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 