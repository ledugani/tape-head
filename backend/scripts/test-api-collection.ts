import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Running tests for collection functionality...');
    
    // Get a test user
    const user = await prisma.user.findFirst();
    
    if (!user) {
      console.error("Missing test user. Please seed the database first.");
      return;
    }
    
    console.log(`Using test user: ${user.email} (ID: ${user.id})`);
    
    // Create a new test tape
    const newTape = await prisma.tape.create({
      data: {
        title: `Test Tape ${Date.now()}`,
        year: 1995,
        genre: "Test",
        format: "VHS",
        label: "Test Label"
      }
    });
    
    console.log(`Created test tape: ${newTape.title} (ID: ${newTape.id})`);
    
    // Add tape to user's collection
    const collectionEntry = await prisma.userCollection.create({
      data: {
        userId: user.id,
        tapeId: newTape.id,
        condition: "Brand New",
        notes: "Created for test"
      }
    });
    
    console.log(`Added tape to collection (ID: ${collectionEntry.id})`);
    
    // Test 1: Get user's collection
    console.log('\n--- Test 1: Get user collection ---');
    const userCollection = await prisma.userCollection.findMany({
      where: {
        userId: user.id
      },
      include: {
        tape: true
      }
    });
    
    if (userCollection.length > 0) {
      console.log(`✅ Test passed: Retrieved collection with ${userCollection.length} items`);
      
      // Check if the newly added tape is in the collection
      const foundNewTape = userCollection.some(item => item.tapeId === newTape.id);
      if (foundNewTape) {
        console.log('✅ Test passed: Newly added tape found in collection');
      } else {
        console.error('❌ Test failed: Newly added tape not found in collection');
      }
      
      // Check if tape details are included
      const hasAllTapeDetails = userCollection.every(
        entry => entry.tape && entry.tape.id && entry.tape.title
      );
      
      if (hasAllTapeDetails) {
        console.log('✅ Test passed: Collection entries include tape details');
        console.log('Sample tape data:', userCollection[0].tape);
      } else {
        console.error('❌ Test failed: Some collection entries missing tape details');
      }
    } else {
      console.error('❌ Test failed: Collection is empty');
    }
    
    // Clean up - remove the test collection entry
    await prisma.userCollection.delete({
      where: {
        id: collectionEntry.id
      }
    });
    console.log(`Cleaned up test collection entry (ID: ${collectionEntry.id})`);
    
    // Clean up - remove the test tape
    await prisma.tape.delete({
      where: {
        id: newTape.id
      }
    });
    console.log(`Cleaned up test tape (ID: ${newTape.id})`);
    
    console.log('\nAll tests completed successfully.');
  } catch (error) {
    console.error('Error during testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 