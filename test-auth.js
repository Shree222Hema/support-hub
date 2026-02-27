const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log("Testing Login...");
    const teamMember = await prisma.teamMember.findFirst({
        where: { email: "admin@omi.com" }
    });
    
    if (!teamMember) {
        console.log("User not found!");
        return;
    }
    
    console.log("User found:", teamMember.email, teamMember.role);
    console.log("Has password:", !!teamMember.password);
    
    const match = await bcrypt.compare("Password123", teamMember.password);
    console.log("Password match:", match);
    
    await prisma.$disconnect();
}
main();
