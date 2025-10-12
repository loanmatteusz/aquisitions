import { logger } from "#config/logger";
import { NextFunction, Request, Response } from "express";
import { createUser } from "#services/auth.service";
import { formatValidationError } from "#utils/format";
import { signUpSchema } from "#validations/auth.validation";
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
