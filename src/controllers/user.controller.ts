import { NextFunction, Request, Response } from 'express';
import { logger } from '#config/logger';
import { formatValidationError } from '#utils/format';
import {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
} from '#services/user.service';
import {
    userIdSchema,
    updateUserSchema,
} from '#validations/user.validation';

export const fetchAllUsers = async (_: Request, response: Response, next: NextFunction) => {
    try {
        logger.info('Getting users...');

        const allUsers = await getAllUsers();

        response.json({
            message: 'Successfully retrieved users',
            users: allUsers,
            count: allUsers.length,
        });
    } catch (error) {
        logger.error(error);
        next(error);
    }
};

export const fetchUserById = async (request: Request, response: Response, next: NextFunction) => {
    try {
        logger.info(`Getting user by id: ${request.params.id}`);

        // Validate the user ID parameter
        const validationResult = userIdSchema.safeParse({ id: request.params.id });

        if (!validationResult.success) {
            return response.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error),
            });
        }

        const { id } = validationResult.data;
        const user = await getUserById(id);

        logger.info(`User ${user.email} retrieved successfully`);
        response.json({
            message: 'User retrieved successfully',
            user,
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error fetching user by id: ${error.message}`);
            if (error.message === 'User not found') {
                return response.status(404).json({ error: 'User not found' });
            }
        }
        logger.error(`Error fetching user by id: ${error}`);
        next(error);
    }
};

export const updateUserById = async (request: Request, response: Response, next: NextFunction) => {
    try {
        logger.info(`Updating user: ${request.params.id}`);

        // Validate the user ID parameter
        const idValidationResult = userIdSchema.safeParse({ id: request.params.id });

        if (!idValidationResult.success) {
            return response.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(idValidationResult.error),
            });
        }

        // Validate the update data
        const updateValidationResult = updateUserSchema.safeParse(request.body);

        if (!updateValidationResult.success) {
            return response.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(updateValidationResult.error),
            });
        }

        const { id } = idValidationResult.data;
        const updates = updateValidationResult.data;

        // Authorization checks
        if (!request.user) {
            return response.status(401).json({
                error: 'Authentication required',
                message: 'You must be logged in to update user information',
            });
        }

        // Extra because of typing
        if (typeof request.user === 'string') {
            return response.status(403).json({ error: 'Invalid token format' });
        }

        // Allow users to update only their own information (except role)
        if (request.user.role !== 'admin' && request.user.id !== id) {
            return response.status(403).json({
                error: 'Access denied',
                message: 'You can only update your own information',
            });
        }

        // Only admin users can change roles
        if (updates.role && request.user.role !== 'admin') {
            return response.status(403).json({
                error: 'Access denied',
                message: 'Only administrators can change user roles',
            });
        }

        // Remove role from updates if non-admin user is trying to update their own profile
        if (request.user.role !== 'admin') {
            delete updates.role;
        }

        const updatedUser = await updateUser(id, updates);

        logger.info(`User ${updatedUser.email} updated successfully`);
        response.json({
            message: 'User updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error updating user: ${error.message}`);
            if (error.message === 'User not found') {
                return response.status(404).json({ error: 'User not found' });
            }
    
            if (error.message === 'Email already exists') {
                return response.status(409).json({ error: 'Email already exists' });
            }
        }
        logger.error(`Error updating user: ${error}`);
        next(error);
    }
};

export const deleteUserById = async (request: Request, response: Response, next: NextFunction) => {
    try {
        logger.info(`Deleting user: ${request.params.id}`);

        // Validate the user ID parameter
        const validationResult = userIdSchema.safeParse({ id: request.params.id });

        if (!validationResult.success) {
            return response.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error),
            });
        }

        const { id } = validationResult.data;

        // Authorization checks
        if (!request.user) {
            return response.status(401).json({
                error: 'Authentication required',
                message: 'You must be logged in to delete users',
            });
        }

        // Extra because of typing
        if (typeof request.user === 'string') {
            return response.status(403).json({ error: 'Invalid token format' });
        }

        // Only admin users can delete users (prevent self-deletion or user deletion by non-admins)
        if (request.user.role !== 'admin') {
            return response.status(403).json({
                error: 'Access denied',
                message: 'Only administrators can delete users',
            });
        }

        // Prevent admins from deleting themselves
        if (request.user.id === id) {
            return response.status(403).json({
                error: 'Operation denied',
                message: 'You cannot delete your own account',
            });
        }

        const deletedUser = await deleteUser(id);

        logger.info(`User ${deletedUser.email} deleted successfully`);
        response.json({
            message: 'User deleted successfully',
            user: deletedUser,
        });
    } catch (error) {
        if (error instanceof Error) {
            logger.error(`Error deleting user: ${error.message}`);
            if (error.message === 'User not found') {
                return response.status(404).json({ error: 'User not found' });
            }
        }
        logger.error(`Error deleting user: ${error}`);
        next(error);
    }
};
