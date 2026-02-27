const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('Password123', 10);
        const manager = await prisma.teamMember.create({
            data: {
                id: uuidv4(),
                name: "Admin User",
                email: "admin@omi.com",
                password: hashedPassword,
                role: "MANAGER"
            }
        });
        console.log("Successfully created Manager:", manager);
    } catch (error) {
        if (error.code === 'P2002') {
            console.log("A user with this email already exists.");
            const hashedPassword = await bcrypt.hash('Password123', 10);
            const updated = await prisma.teamMember.update({
                where: { email: "admin@omi.com" },
                data: {
                    role: "MANAGER",
                    password: hashedPassword
                }
            });
            console.log("Updated existing user to MANAGER with default password:", updated);
        } else {
            console.error("Error:", error);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main();
