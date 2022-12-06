import { PrismaClient, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const userData: Prisma.UserCreateInput[] = [
  {
    firstName: 'Nik',
    lastName: 'Graf',
    email: 'nik@example.com', 
    password : '123456',
  },
  {
    firstName: 'Nilu',
    lastName: 'Grafi',
    email: 'nilu@example.com',
    password : '123456',
  },
  {
    firstName: 'Gaurav',
    lastName: 'Rai',
    email: 'gaurav@example.com',
    password : '123456',
  },
]

const postData: Prisma.PostCreateInput[] = [
  {
    content: 'This is my first post',
    author: {
      connect: { id: 1 },
    },
    published: true,
  },
  {
    content: 'This is my second post',
    author: {
      connect: { id: 1 },
    },
    published: false,
  },
  {
    content: 'This is awesome',
    author: {
      connect: { id: 2 },
    },
    published: true,
  },
  {
    content: 'hola! amigos',
    author: {
      connect: { id: 3 },
    },
    published: false,
  },
  {
    content: 'Kaise ho mitron!',
    author: {
      connect: { id: 3 },
    },
    published: true,
  }
]

async function main() {
  console.log(`Start seeding ...`)
  for (const u of userData) {
    const user = await prisma.user.create({
      data: u,
    })
    console.log(`Created user with id: ${user.id}`)
  }
  for (const p of postData) {
    const post = await prisma.post.create({
      data: p,
    })
    console.log(`Created post with id: ${post.id}`)
  }
  console.log(`Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })