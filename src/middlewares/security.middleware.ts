import { NextFunction, Request, Response } from 'express';
import { slidingWindow } from '@arcjet/node';
import { aj } from '#config/arcjet';
import { logger } from '#config/logger';

const securityMiddleware = async (request: Request, response: Response, next: NextFunction) => {
    try {
        if (typeof request.user === 'string') {
            return response.status(403).json({ error: 'Invalid user format' });
        }
        const role = request.user?.role || 'guest';
        
        let limit;
        let message;

        switch (role) {
            case 'admin':
                limit = 20;
                message = 'Admin request exceeded (20 per minute). Shlow down.';
                break;
            case 'user':
                limit = 10;
                message = 'User request exceeded (10 per minute). Shlow down.';
                break;
            default:
                limit = 5;
                message = 'Guest request exceeded (5 per minute). Shlow down.';
                break;
        }

        const client = aj.withRule(slidingWindow({ mode: 'LIVE', interval: '1m', max: limit, /*name: `${role}-rate-limit`*/ }));
        const decision = await client.protect(request);

        if (decision.isDenied() && decision.reason.isBot()) {
            logger.warn('Bot request blocked', { ip: request.ip, userAgent: request.get('User-Agent'), path: request.path });
            return response.status(403).json({ error: 'Forbidden', message: 'Automated requests are not allowed' });
        }

        if (decision.isDenied() && decision.reason.isShield()) {
            logger.warn('Shield request blocked', { ip: request.ip, userAgent: request.get('User-Agent'), path: request.path, method: request.method });
            return response.status(403).json({ error: 'Forbidden', message: 'Requests blocked by security policy' });
        }

        if (decision.isDenied() && decision.reason.isRateLimit()) {
            logger.warn('Rate limit exceeded', { ip: request.ip, userAgent: request.get('User-Agent'), path: request.path });
            return response.status(403).json({ error: 'Forbidden', message: 'Too many requests' });
        }

        next();
    } catch (error) {
        console.error('Arcjet middleware error:', error);
        response.status(500).json({ error: 'Internal server error', message: 'Something went wrong with security middleware' });
    }
}

export { securityMiddleware };
