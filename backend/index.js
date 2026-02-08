import express from 'express'
import dotenv from 'dotenv'
dotenv.config();
import connectdb from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/user.routes.js';
import geminiResponse from './gemini.js';

const port = process.env.PORT || 5000;

const app = express();

const allowedOrigins = [
    ...(process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()).filter(Boolean) : []),
    /^http:\/\/localhost:\d+$/,
    /^http:\/\/127\.0\.0\.1:\d+$/
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, true);
        }

        const isAllowed = allowedOrigins.some((rule) => {
            if (rule instanceof RegExp) {
                return rule.test(origin);
            }
            return rule === origin;
        });
        if (isAllowed) {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);

const startServer = async () => {
    const dbConnected = await connectdb();
    if (!dbConnected) {
        console.log("Server not started: database is unavailable.");
        process.exit(1);
    }

    app.listen(port, ()=> {
        console.log(`Server is running on port ${port}`);
    });
};

startServer();
