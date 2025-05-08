import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const tape = await prisma.tape.create({
    data: {
      title: "The Terminator",
      year: 1984,
      genre: "Action",
      format: "Clamshell",
      label: "Orion Pictures",
      coverImage: "https://example.com/terminator.jpg"
    }
  })
  console.log('Created test record:', tape)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 