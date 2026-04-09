import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

async function main() {
  try {
    console.log('Trying with empty object {}...')
    const prisma = new PrismaClient({})
    console.log('Successfully initialized PrismaClient with {}')
    // await prisma.$connect()
    console.log('Successfully connected')
    await prisma.$disconnect()
  } catch (error) {
    console.error('Failed with {}:')
    console.error(error)
  }
}

main()
