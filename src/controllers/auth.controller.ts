import { NextFunction, Request, Response } from "express";
import { logger } from "#config/logger";
import { authenticateUser, createUser } from "#services/auth.service";
import { signInSchema, signUpSchema } from "#validations/auth.validation";
import { formatValidationError } from "#utils/format";
import { jwtToken } from "#utils/jwt";
import { cookies } from "#utils/cookies";

export const signUp = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validationResult = signUpSchema.safeParse(request.body);

        if (!validationResult.success) {
            return response.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error),
            });
        }

        const { name, email, password, role } = validationResult.data;

        const user = await createUser({ name, email, password, role });
        const token = jwtToken.sign({ id: user.id, email: user.email, role: user.role });
        cookies.set(response, 'token', token);

        logger.info(`User registered successfully: ${email}`);
        response.status(201).json({
            message: 'User registered',
            user: {
                id: 1, name: user.name, email: user.email, role: user.role,
            },
        });
    } catch (error) {
        logger.error('Erorr to try to SignUp', error);
        next(error);
    }
}

export const signIn = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const validationResult = signInSchema.safeParse(request.body);

        if (!validationResult.success) {
            return response.status(400).json({
                error: 'Validation failed',
                details: formatValidationError(validationResult.error),
            });
        }

        const { email, password } = validationResult.data;

        const user = await authenticateUser({ email, password });

        const token = jwtToken.sign({
            id: user.id,
            email: user.email,
            role: user.role,
        });

        cookies.set(response, 'token', token);

        logger.info(`User signed in successfully: ${email}`);
        response.status(200).json({
            message: 'User signed in successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        logger.error('Sign in error', error);

        if (error instanceof Error) {
            if (error.message === 'User not found' || error.message === 'Invalid password') {
                return response.status(401).json({ error: 'Invalid credentials' });
            }
        }

        next(error);
    }
};

export const signOut = async (_: Request, response: Response, next: NextFunction) => {
    try {
        cookies.clear(response, 'token');

        logger.info('User signed out successfully');
        response.status(200).json({
            message: 'User signed out successfully',
        });
    } catch (e) {
        logger.error('Sign out error', e);
        next(e);
    }
};
