import { User } from '#models/user.model';
import type { JwtPayload } from 'jsonwebtoken';

declare global {
    namespace Express {
        export interface Request {
            user?: string | JwtPayload | Partial<Omit<User, 'password'>>;
        }
    }
}
