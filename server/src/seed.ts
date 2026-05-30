import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI as string);
        console.log('Connected to MongoDB for seeding...');

        await User.deleteMany({});
        console.log('Cleared existing users.');

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash('Test@1234', salt);

        const roles = ['Admin', 'Sales', 'Sanction', 'Disbursement', 'Collection', 'Borrower'];

        const usersToInsert = roles.map((role) => ({
            name: `${role} User`,
            email: `${role.toLowerCase()}@lms.com`,
            passwordHash,
            role
        }));

        await User.insertMany(usersToInsert);
        console.log('Successfully seeded database with users:');
        usersToInsert.forEach(u => console.log(`- ${u.email} : Test@1234 : ${u.role}`));

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();