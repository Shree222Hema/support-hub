const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');

const prisma = new PrismaClient();

async function main() {
    try {
        const manager = await prisma.teamMember.create({
            data: {
                id: uuidv4(),
                name: "Admin User",
                email: "admin@omi.com",
                role: "MANAGER",
                is_active: true
            }
        });
        console.log("Successfully created Manager:", manager);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log("A user with this email already exists.");
            // Try to update them to a manager
            const updated = await prisma.teamMember.update({
                where: { email: "admin@omi.com" },
                data: { role: "MANAGER" }
            });
            console.log("Updated existing user to MANAGER:", updated);
        } else {
            console.error("Error:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
