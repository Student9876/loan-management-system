import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

mongoose
    .connect(process.env.MONGODB_URI as string)
    .then(() => {
        console.log('Database connection established.');
        app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
    })
    .catch((error) => {
        console.error('Database connection failed:', error);
        process.exit(1);
    });