import express, { Request, Response } from 'express';
import { signUp } from 'src/controllers/auth.controller';

const router = express();

router.post('/sign-up', signUp);

router.post('/sign-in', (_: Request, response: Response) => {
    response.send('POST /api/auth/sign-in response');
});

router.post('/sign-out', (_: Request, response: Response) => {
    response.send('POST /api/auth/sign-out response');
});

export { router as authRoutes };
