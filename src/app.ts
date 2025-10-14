import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger } from '#config/logger';
import { securityMiddleware } from '#middlewares/security.middleware';
import { authRoutes } from '#routes/auth.routes';
import { userRoutes } from '#routes/user.routes';

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', {
    stream: {
        write: (message: string) => logger.info(message.trim()),
    },
}));
app.use(securityMiddleware);

app.get('/health', (_, response) => {
    response.status(200).json({ status: 'OK', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

app.get('/api', (_, response) => {
    response.status(200).json({ status: 'Acquisitions API is running!' });
});

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

export { app };
