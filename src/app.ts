import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { logger } from '#config/logger';

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

app.get('/health-check', (_, response) => {
    logger.info("health check is working");
    response.status(200).send("Ok");
});

export { app };
