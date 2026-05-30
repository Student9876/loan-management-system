import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../models/User';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing users to prevent duplicate key errors during evaluation
        await User.deleteMany({});
        console.log('Cleared existing users.');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Test@1234', salt);

        const users = [
            { name: 'System Admin', email: 'admin@lms.com', passwordHash, role: 'Admin' },
            { name: 'Sales Executive', email: 'sales@lms.com', passwordHash, role: 'Sales' },
            { name: 'Sanction Executive', email: 'sanction@lms.com', passwordHash, role: 'Sanction' },
            { name: 'Disbursement Exec', email: 'disbursement@lms.com', passwordHash, role: 'Disbursement' },
            { name: 'Collection Exec', email: 'collection@lms.com', passwordHash, role: 'Collection' },
            { name: 'Test Borrower', email: 'borrower@lms.com', passwordHash, role: 'Borrower' }
        ];

        await User.insertMany(users);
        console.log('\nSuccessfully seeded database with evaluator accounts:');
        users.forEach(u => console.log(`- ${u.role.padEnd(12)} | ${u.email} | Test@1234`));

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();