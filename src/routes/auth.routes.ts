import express, { Request, Response } from 'express';

const router = express();

router.post('/sign-up', (_: Request, response: Response) => {
    response.send('POST /api/auth/sign-up response');
});

router.post('/sign-in', (_: Request, response: Response) => {
    response.send('POST /api/auth/sign-in response');
});

router.post('/sign-out', (_: Request, response: Response) => {
    response.send('POST /api/auth/sign-out response');
});

export { router as authRoutes };
