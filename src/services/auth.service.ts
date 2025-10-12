import bcrypt from 'bcrypt';
import { db } from '#config/database';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model';
import { logger } from "#config/logger";

type CreateUserDto = { name: string, email: string, password: string, role: string };

export const hashPassword = async (password: string): Promise<string> => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        logger.error(`Error to hashing the password: ${error}`);
        throw new Error('Error hashing');
    }
}

export const createUser = async ({ name, email, password, role = 'user' }: CreateUserDto) => {
    try {
        const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);

        if (existingUser.length > 0) throw new Error('User already exists');

        const hashedPassword = await hashPassword(password);

        const [ newUser ] = await db
            .insert(users)
            .values({ name, email, password: hashedPassword, role })
            .returning({ id: users.id, name: users.name, email: users.email, role: users.role, created_at: users.created_at });

        logger.info(`User ${newUser.email} created successfully`);
        return newUser;
    } catch (error) {
        logger.error(`Error to creating user: ${error}`);
        throw new Error('Error creating');
    }
}
