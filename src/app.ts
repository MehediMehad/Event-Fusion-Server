import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import httpStatus from 'http-status';
import { demoInfoCreateJob } from './app/job/demoInfoCreate';

const app: Application = express();

// Start the cron job
demoInfoCreateJob();

app.use(express.json()); // Parse JSON body
app.use(cookieParser()); // Parse cookies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded HTML form data
app.use(
    cors({
        origin: ['http://localhost:5173', "http://localhost:3000", "https://event-fusion-client.vercel.app"], // Allow requests from frontend
        credentials: true // 👉 Allow sending cookies/credentials
    })
);

app.get('/', (req: Request, res: Response) => {
    res.send({
        message: 'Hello from the Health Care Server!'
    });
});

app.use('/api/v1/', router);
app.use(globalErrorHandler);
app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`🟥 Requested path: ${req.method} ${req.originalUrl}`);

    res.status(httpStatus.NOT_FOUND).json({
        success: false,
        message: 'API NOT FOUND',
        error: {
            path: req.originalUrl,
            message: 'Your requested path is not found'
        }
    });
});
export default app;
