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
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/user', userRouter);


app.listen(port, ()=> {
    connectdb();
    console.log(`Server is running on port ${port}`);
})