const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const members = await prisma.teamMember.findMany();
  console.log("Team members:", members);
  await prisma.$disconnect();
}
main();
