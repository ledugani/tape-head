import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    const tape = await prisma.tape.findFirst();

    if (user && tape) {
      const collectionEntry = await prisma.userCollection.create({
        data: {
          userId: user.id,
          tapeId: tape.id,
          condition: "Very Good",
          notes: "Original rental copy with intact case",
        },
        include: {
          tape: true,
          user: true,
        },
      });

      console.log("UserCollection entry created:", JSON.stringify(collectionEntry, null, 2));
    } else {
      console.error("Missing required user or tape to create UserCollection entry.");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 