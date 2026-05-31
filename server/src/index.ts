import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';


import loanRoutes from './routes/loan.routes';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/loans', loanRoutes);

app.get('/', (req , res) => {
    res.status(200).json({
        status: 'active',
        message: 'LMS API is running.',
        timestamp: new Date().toISOString()
    });
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