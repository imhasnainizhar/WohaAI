import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import argon2 from 'argon2';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

async function main() {
    logger.info('🌱 Starting user seeding...');

    const passwordHash = await argon2.hash('password123');

    for (let i = 0; i < 10; i++) {
        const firstName = faker.person.firstName();
        const lastName = faker.person.lastName();
        const username = faker.internet.username({ firstName, lastName }).toLowerCase() + Math.floor(Math.random() * 1000);
        const email = faker.internet.email({ firstName, lastName });

        try {
            const user = await prisma.user.create({
                data: {
                    email,
                    username,
                    name: `${firstName} ${lastName}`,
                    password: passwordHash,
                },
            });
            logger.info(`✅ Created user: ${user.username} (${user.email})`);
        } catch (error) {
            logger.error(`❌ Failed to create user ${username}: ${(error as Error).message}`);
        }
    }

    logger.info('✨ Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
