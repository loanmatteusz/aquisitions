import { logger } from '#config/logger';
import { jwtToken } from '#utils/jwt';
import { NextFunction, Request, Response } from 'express';

export const authenticateToken = (request: Request, response: Response, next: NextFunction) => {
    try {
        const token = request.cookies.token;

        if (!token) {
            return response.status(401).json({
                error: 'Authentication required',
                message: 'No access token provided',
            });
        }

        const decoded = jwtToken.verify(token);

        if (typeof decoded === 'string') {
            logger.warn(`Invalid token format: expected object, got string`);
            return response.status(403).json({
                error: 'Invalid token',
                message: 'Malformed token payload',
            });
        }

        request.user = decoded;

        logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);
        next();
    } catch (error) {
        if (error instanceof Error) {
            logger.error('Authentication error:', error.message);
            if (error.message === 'Failed to authenticate token') {
                return response.status(401).json({
                    error: 'Authentication failed',
                    message: 'Invalid or expired token',
                });
            }
        }
        logger.error('Authentication error:', error);
        return response.status(500).json({
            error: 'Internal server error',
            message: 'Error during authentication',
        });
    }
};

export const requireRole = (allowedRoles: string[]) => {
    return (request: Request, response: Response, next: NextFunction) => {
        try {
            if (!request.user) {
                return response.status(401).json({
                    error: 'Authentication required',
                    message: 'User not authenticated',
                });
            }

            // Extra because of typing
            if (typeof request.user === 'string') {
                return response.status(403).json({ error: 'Invalid user format' });
            }

            if (!allowedRoles.includes(request.user.role)) {
                logger.warn(
                    `Access denied for user ${request.user.email} with role ${request.user.role}. Required: ${allowedRoles.join(', ')}`
                );
                return response.status(403).json({
                    error: 'Access denied',
                    message: 'Insufficient permissions',
                });
            }

            next();
        } catch (e) {
            logger.error('Role verification error:', e);
            return response.status(500).json({
                error: 'Internal server error',
                message: 'Error during role verification',
            });
        }
    };
};
