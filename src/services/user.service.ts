import { eq } from 'drizzle-orm';
import { db } from '#config/database';
import { logger } from '#config/logger';
import { UpdateUser, users } from '#models/user.model';

export const getAllUsers = async () => {
    try {
        return await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at,
            })
            .from(users);
    } catch (e) {
        logger.error('Error getting users', e);
        throw e;
    }
};

export const getUserById = async (id: number) => {
    try {
        const [user] = await db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at,
            })
            .from(users)
            .where(eq(users.id, id))
            .limit(1);

        if (!user) {
            throw new Error('User not found');
        }

        return user;
    } catch (e) {
        logger.error(`Error getting user by id ${id}:`, e);
        throw e;
    }
};

export const updateUser = async (id: number, updates: UpdateUser) => {
    try {
        // First check if user exists
        const existingUser = await getUserById(id);

        // Check if email is being updated and if it already exists
        if (updates.email && updates.email !== existingUser.email) {
            const [emailExists] = await db
                .select()
                .from(users)
                .where(eq(users.email, updates.email))
                .limit(1);
            if (emailExists) {
                throw new Error('Email already exists');
            }
        }

        // Add updated_at timestamp
        const updateData = {
            ...updates,
            updated_at: new Date(),
        };

        const [updatedUser] = await db
            .update(users)
            .set(updateData)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
                created_at: users.created_at,
                updated_at: users.updated_at,
            });

        logger.info(`User ${updatedUser.email} updated successfully`);
        return updatedUser;
    } catch (e) {
        logger.error(`Error updating user ${id}:`, e);
        throw e;
    }
};

export const deleteUser = async (id: number) => {
    try {
        // First check if user exists
        await getUserById(id);

        const [deletedUser] = await db
            .delete(users)
            .where(eq(users.id, id))
            .returning({
                id: users.id,
                email: users.email,
                name: users.name,
                role: users.role,
            });

        logger.info(`User ${deletedUser.email} deleted successfully`);
        return deletedUser;
    } catch (e) {
        logger.error(`Error deleting user ${id}:`, e);
        throw e;
    }
};
