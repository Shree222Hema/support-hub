const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.teamMember.findMany();
        const hashedPassword = await bcrypt.hash('Password123', 10);

        console.log(`Setting default password "Password123" for ${users.length} users...`);

        for (const user of users) {
            await prisma.teamMember.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
            console.log(`Updated user: ${user.email}`);
        }

        console.log('Successfully updated all users with default password.');
    } catch (error) {
        console.error('Error updating users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
