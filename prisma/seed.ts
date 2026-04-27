import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const email = 'user@example.com'
  const password = 'password1166'
  const name = 'Regular User'
  const role = 'USER'

  console.log('Attempting to create test user...')

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, password, name, role } as any,
    })
    console.log('User created/found:', user)
  } catch (error: any) {
    if (error.code === 'P2031') {
      console.log('Detected standalone MongoDB. Using raw command fallback...')
      
      const existing = await prisma.user.findFirst({ where: { email } })
      if (!existing) {
        await (prisma as any).$runCommandRaw({
          insert: 'User',
          documents: [{
            email,
            password,
            name,
            role,
            createdAt: { "$date": new Date().toISOString() }
          }]
        })
        console.log('User created via raw command.')
      } else {
        console.log('User already exists.')
      }
    } else {
      throw error;
    }
  }
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
