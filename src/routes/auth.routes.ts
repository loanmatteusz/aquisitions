import express, { Request, Response } from 'express';
import { signIn, signOut, signUp } from 'src/controllers/auth.controller';

const router = express();

router.post('/sign-up', signUp);
router.post('/sign-in', signIn);
router.post('/sign-out', signOut);

export { router as authRoutes };
