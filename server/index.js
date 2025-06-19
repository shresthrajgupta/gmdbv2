import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cookieParser from 'cookie-parser';

import connectDB from './utils/db.js';

import { notFound, errorHandler } from './middlewares/errorMiddleware.js';

import userRoute from "./routes/userRoute.js";
import gameRoute from "./routes/gameRoute.js";
import ratingRoute from "./routes/ratingRoute.js";
import franchiseRoute from "./routes/franchiseRoute.js";

dotenv.config();
connectDB();

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api/users', userRoute);
app.use('/api/games', gameRoute);
app.use('/api/ratings', ratingRoute);
app.use('/api/franchises', franchiseRoute);

if (process.env.NODE_ENV === 'development') {
    app.get('/', (req, res) => {
        res.send('API is running...');
    });
} else {
    const __dirname = path.resolve();

    app.use(express.static(path.join(__dirname, '/client/dist')));

    app.get('*splat', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'dist', 'index.html'));
    });
}

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});