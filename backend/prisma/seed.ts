import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create Warner Home Video publisher
  const warnerHomeVideo = await prisma.publisher.upsert({
    where: { name: 'Warner Home Video' },
    update: {},
    create: {
      name: 'Warner Home Video',
      description: 'Warner Home Video was a leading distributor of VHS tapes, releasing countless classics throughout the 1980s and 1990s.',
    }
  })
  console.log('Created/updated publisher:', warnerHomeVideo.name)

  // Create some sample tapes
  const tapes = [
    {
      title: 'The Terminator',
      year: 1984,
      genre: 'Action',
      format: 'VHS',
      label: 'Orion Pictures',
      coverImage: '/images/placeholder-vhs.svg',
      publisherId: warnerHomeVideo.id
    },
    {
      title: 'Back to the Future',
      year: 1985,
      genre: 'Science Fiction',
      format: 'VHS',
      label: 'Universal',
      coverImage: '/images/placeholder-vhs.svg',
      publisherId: warnerHomeVideo.id
    },
    {
      title: 'The Matrix',
      year: 1999,
      genre: 'Science Fiction',
      format: 'VHS',
      label: 'Warner Home Video',
      coverImage: '/images/placeholder-vhs.svg',
      publisherId: warnerHomeVideo.id
    }
  ]

  for (const tape of tapes) {
    await prisma.tape.upsert({
      where: {
        title_year: {
          title: tape.title,
          year: tape.year
        }
      },
      update: {},
      create: tape
    })
    console.log('Created/updated tape:', tape.title)
  }

  // Create 20th Century Fox Home Entertainment publisher
  const foxHomeEntertainment = await prisma.publisher.upsert({
    where: { name: '20th Century Fox Home Entertainment' },
    update: {},
    create: {
      name: '20th Century Fox Home Entertainment',
      description: 'A major distributor of home video releases, including the iconic Star Wars Trilogy VHS sets in the 1980s and 1990s.',
    }
  })
  console.log('Created/updated publisher:', foxHomeEntertainment.name)

  // Create Star Wars Trilogy box set
  const starWarsBoxSet = await prisma.boxSet.create({
    data: {
      title: 'Star Wars Trilogy',
      year: 1995,
      label: '20th Century Fox Home Entertainment',
      coverImage: 'https://m.media-amazon.com/images/I/81svVQ09gUL._AC_SY879_.jpg',
      description: "1995 'faces' VHS box set containing the original Star Wars trilogy: A New Hope, The Empire Strikes Back, and Return of the Jedi."
    }
  })
  console.log('Created box set:', starWarsBoxSet.title)

  // Create Star Wars: A New Hope tape
  const aNewHope = await prisma.tape.upsert({
    where: {
      title_year: {
        title: 'Star Wars: A New Hope',
        year: 1977
      }
    },
    update: {},
    create: {
      title: 'Star Wars: A New Hope',
      year: 1977,
      genre: 'Science Fiction',
      format: 'VHS',
      label: '20th Century Fox Home Entertainment',
      coverImage: 'https://m.media-amazon.com/images/I/91clmT6bjLL._AC_SY879_.jpg',
      publisherId: foxHomeEntertainment.id,
      boxSetId: starWarsBoxSet.id
    }
  })
  console.log('Created/updated tape:', aNewHope.title)

  // Create Star Wars: The Empire Strikes Back tape
  const empireStrikesBack = await prisma.tape.upsert({
    where: {
      title_year: {
        title: 'Star Wars: The Empire Strikes Back',
        year: 1980
      }
    },
    update: {},
    create: {
      title: 'Star Wars: The Empire Strikes Back',
      year: 1980,
      genre: 'Science Fiction',
      format: 'VHS',
      label: '20th Century Fox Home Entertainment',
      coverImage: 'https://m.media-amazon.com/images/I/91v0bZlH06L._AC_SY879_.jpg',
      publisherId: foxHomeEntertainment.id,
      boxSetId: starWarsBoxSet.id
    }
  })
  console.log('Created/updated tape:', empireStrikesBack.title)

  // Create Star Wars: Return of the Jedi tape
  const returnOfTheJedi = await prisma.tape.upsert({
    where: {
      title_year: {
        title: 'Star Wars: Return of the Jedi',
        year: 1983
      }
    },
    update: {},
    create: {
      title: 'Star Wars: Return of the Jedi',
      year: 1983,
      genre: 'Science Fiction',
      format: 'VHS',
      label: '20th Century Fox Home Entertainment',
      coverImage: 'https://m.media-amazon.com/images/I/91VsUoZoI5L._AC_SY879_.jpg',
      publisherId: foxHomeEntertainment.id,
      boxSetId: starWarsBoxSet.id
    }
  })
  console.log('Created/updated tape:', returnOfTheJedi.title)

  // Log IDs for testing
  console.log('\nTest Data IDs:')
  console.log('Warner Home Video Publisher ID:', warnerHomeVideo.id)
  console.log('\nStar Wars Trilogy Data:')
  console.log('20th Century Fox Publisher ID:', foxHomeEntertainment.id)
  console.log('Star Wars Trilogy Box Set ID:', starWarsBoxSet.id)
  console.log('A New Hope Tape ID:', aNewHope.id)
  console.log('The Empire Strikes Back Tape ID:', empireStrikesBack.id)
  console.log('Return of the Jedi Tape ID:', returnOfTheJedi.id)
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 