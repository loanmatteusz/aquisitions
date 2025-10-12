import bcrypt from 'bcrypt';
import { db } from '#config/database';
import { eq } from 'drizzle-orm';
import { users } from '#models/user.model';
import { logger } from "#config/logger";

type CreateUserDto = { name: string, email: string, password: string, role: string };
type AuthenticateUserDto = { email: string, password: string };

export const hashPassword = async (password: string): Promise<string> => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        logger.error(`Error to hashing the password: ${error}`);
        throw new Error('Error hashing');
    }
}

export const comparePassword = async (password: string, hashedPassword: string): Promise<boolean> => {
    try {
        return await bcrypt.compare(password, hashedPassword);
    } catch (e) {
        logger.error(`Error comparing password: ${e}`);
        throw new Error('Error comparing password');
    }
};

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

export const authenticateUser = async ({ email, password }: AuthenticateUserDto) => {
    try {
        const [existingUser] = await db
            .select()
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!existingUser) {
            throw new Error('User not found');
        }

        const isPasswordValid = await comparePassword(
            password,
            existingUser.password
        );

        if (!isPasswordValid) {
            throw new Error('Invalid password');
        }

        logger.info(`User ${existingUser.email} authenticated successfully`);
        return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            created_at: existingUser.created_at,
        };
    } catch (e) {
        logger.error(`Error authenticating user: ${e}`);
        throw e;
    }
};
