import { logger } from '#config/logger';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '1d';

type Payload = string | Buffer | object;

const errorMessage = 'Failed to authenticate token';

export const jwtToken = {
    sign: (payload: Payload) => {
        try {
            return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
        } catch (error) {
            logger.error(errorMessage, error);
            throw new Error(errorMessage);
        }
    },
    verify: (token: string) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            logger.error(errorMessage, error);
            throw new Error(errorMessage);
        }
    },
};
