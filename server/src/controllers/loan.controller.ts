import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import Loan from '../models/Loan';
import User from '../models/User';
import { executeBre } from '../services/bre.service';

export const uploadSalarySlip = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'No file provided or invalid file type.' });
            return;
        }
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: 'auto',
            folder: 'lms_salary_slips',
        });
        res.status(200).json({ url: result.secure_url });
    } catch (error: any) {
        res.status(500).json({ message: 'Error uploading to Cloudinary', error: error.message });
    }
};

export const applyForLoan = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = (req as any).user.id;
        const { pan, dob, monthlySalary, employmentMode, salarySlipUrl, amount, tenure } = req.body;

        // 1. Run Server-Side Business Rule Engine
        const breResult = executeBre({ pan, dob, monthlySalary, employmentMode });
        if (!breResult.passed) {
            res.status(400).json({ message: 'Application rejected by BRE', errors: breResult.errors });
            return;
        }

        // 2. Calculate Simple Interest & Total Repayment
        const interestRate = 12; // Fixed 12% p.a.
        const simpleInterest = (amount * interestRate * tenure) / (365 * 100);
        const totalRepayment = amount + simpleInterest;

        // 3. Create Loan Document
        const loan = await Loan.create({
            borrowerId: userId,
            pan,
            dob,
            monthlySalary,
            employmentMode,
            salarySlipUrl,
            amount,
            tenure,
            interestRate,
            totalRepayment,
            outstandingBalance: totalRepayment,
            status: 'Applied'
        });

        res.status(201).json({ message: 'Loan application submitted successfully', loan });
    } catch (error: any) {
        res.status(500).json({ message: 'Error processing loan application', error: error.message });
    }
};

export const getDashboardLoans = async (req: Request, res: Response): Promise<void> => {
    try {
        const role = (req as any).user.role;
        let query = {};

        // Filter loans strictly based on the executive's role
        switch (role) {
            case 'Sanction':
                query = { status: 'Applied' };
                break;
            case 'Disbursement':
                query = { status: 'Sanctioned' };
                break;
            case 'Collection':
                query = { status: 'Disbursed' };
                break;
            case 'Sales':
                // Sales tracks leads: Borrowers who have registered but have no loan document
                const borrowersWithLoans = await Loan.distinct('borrowerId');
                const leads = await User.find({ role: 'Borrower', _id: { $nin: borrowersWithLoans } }).select('-passwordHash');
                res.status(200).json({ data: leads, type: 'leads' });
                return;
            case 'Admin':
                query = {}; // Admin sees all
                break;
            default:
                res.status(403).json({ message: 'Role not authorized for dashboard access.' });
                return;
        }

        const loans = await Loan.find(query).populate('borrowerId', 'name email');
        res.status(200).json({ data: loans, type: 'loans' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
    }
};

export const updateLoanStatus = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const role = (req as any).user.role;

        const loan = await Loan.findById(id);
        if (!loan) {
            res.status(404).json({ message: 'Loan not found' });
            return;
        }

        // Strict State Machine Enforcement based on Role
        let isValidTransition = false;
        if (role === 'Sanction' || role === 'Admin') {
            if (loan.status === 'Applied' && (status === 'Sanctioned' || status === 'Rejected')) {
                isValidTransition = true;
            }
        } else if (role === 'Disbursement' || role === 'Admin') {
            if (loan.status === 'Sanctioned' && status === 'Disbursed') {
                isValidTransition = true;
            }
        }

        if (!isValidTransition) {
            res.status(400).json({ message: `Invalid status transition to ${status} for role ${role}` });
            return;
        }

        loan.status = status;
        if (status === 'Rejected' && rejectionReason) {
            loan.rejectionReason = rejectionReason;
        }

        await loan.save();
        res.status(200).json({ message: `Loan status updated to ${status}`, loan });
    } catch (error: any) {
        res.status(500).json({ message: 'Error updating loan status', error: error.message });
    }
};