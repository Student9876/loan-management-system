import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';
import Loan from '../models/Loan';
import User from '../models/User';
import { executeBre } from '../services/bre.service';
import multer from 'multer';
import { upload } from '../middlewares/upload.middleware';

export const uploadSalarySlip = (req: Request, res: Response): void => {
    const singleUpload = upload.single('file');

    singleUpload(req, res, async (err: any) => {
        // 1. Intercept Multer Errors (e.g., 5MB limit)
        if (err instanceof multer.MulterError) {
            if (err.code === 'LIMIT_FILE_SIZE') {
                res.status(400).json({ message: 'File is too large. Maximum size is 5MB.' });
                return;
            }
            res.status(400).json({ message: err.message });
            return;
        } else if (err) {
            // Catch custom fileFilter errors (e.g., wrong file type)
            res.status(400).json({ message: err.message || 'File upload failed' });
            return;
        }

        // 2. Process Cloudinary Upload
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
    });
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
        const userId = (req as any).user.id;
        const role = (req as any).user.role;

        // BORROWER: Return only their specific loans
        if (role === 'Borrower') {
            const myLoans = await Loan.find({ borrowerId: userId }).sort({ createdAt: -1 });
            res.status(200).json({ data: myLoans });
            return;
        }

        // HELPER: Compute virtual leads for Sales & Admin
        const fetchLeads = async () => {
            const allBorrowers = await User.find({ role: 'Borrower' }).select('name email createdAt');
            const allLoans = await Loan.find().select('borrowerId');
            const borrowersWithLoans = new Set(allLoans.map(l => l.borrowerId.toString()));

            return allBorrowers
                .filter(b => !borrowersWithLoans.has(b._id.toString()))
                .map(b => ({
                    _id: b._id.toString(), // Use User ID to prevent frontend key crashes
                    borrowerId: { name: b.name, email: b.email },
                    status: 'Lead',
                    totalRepayment: 0,
                    outstandingBalance: 0,
                    tenure: 0,
                    createdAt: (b as any).createdAt || new Date()
                }));
        };

        // SALES: Return ONLY the leads
        if (role === 'Sales') {
            const leads = await fetchLeads();
            res.status(200).json({ data: leads });
            return;
        }

        // OTHER ROLES: State machine queries
        let query = {};
        if (role === 'Sanction') query = { status: 'Applied' };
        else if (role === 'Disbursement') query = { status: 'Sanctioned' };
        else if (role === 'Collection') query = { status: 'Disbursed' };

        const loans = await Loan.find(query)
            .populate('borrowerId', 'name email')
            .sort({ createdAt: -1 });

        // ADMIN: Combine both actual loans AND virtual leads
        if (role === 'Admin') {
            const leads = await fetchLeads();
            res.status(200).json({ data: [...leads, ...loans] });
            return;
        }

        res.status(200).json({ data: loans });
    } catch (err) {
        const error = err as Error;
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

        if (loan.status === 'Applied' && (status === 'Sanctioned' || status === 'Rejected')) {
            if (role === 'Sanction' || role === 'Admin') isValidTransition = true;
        }
        else if (loan.status === 'Sanctioned' && status === 'Disbursed') {
            if (role === 'Disbursement' || role === 'Admin') isValidTransition = true;
        }
        else if (loan.status === 'Disbursed' && status === 'Closed') {
            if (role === 'Collection' || role === 'Admin') isValidTransition = true;
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


export const recordPayment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { utr, amount } = req.body;
        const role = (req as any).user.role;

        if (role !== 'Collection' && role !== 'Admin') {
            res.status(403).json({ message: 'Unauthorized access to collections' });
            return;
        }

        if (!utr || !amount || amount <= 0) {
            res.status(400).json({ message: 'Valid UTR and a positive amount are required' });
            return;
        }

        // 1. Enforce global UTR uniqueness
        const existingUtr = await Loan.findOne({ 'payments.utr': utr });
        if (existingUtr) {
            res.status(400).json({ message: 'Duplicate UTR: This payment has already been recorded in the system.' });
            return;
        }

        // 2. Fetch active loan
        const loan = await Loan.findById(id);
        if (!loan) {
            res.status(404).json({ message: 'Loan not found' });
            return;
        }

        if (loan.status !== 'Disbursed') {
            res.status(400).json({ message: `Cannot record payment on a loan in ${loan.status} state.` });
            return;
        }

        // 3. Mathematical validation
        if (amount > loan.outstandingBalance) {
            res.status(400).json({
                message: `Payment of ₹${amount} exceeds the outstanding balance of ₹${loan.outstandingBalance}.`
            });
            return;
        }

        // 4. Ledger entry and balance update
        loan.payments.push({ utr, amount, date: new Date() });
        loan.outstandingBalance -= amount;

        // 5. Auto-close mechanism
        if (loan.outstandingBalance === 0) {
            loan.status = 'Closed';
        }

        await loan.save();

        res.status(200).json({
            message: loan.status === 'Closed' ? 'Final payment processed. Loan Closed.' : 'Partial payment recorded successfully.',
            loan
        });
    } catch (err) {
        const error = err as Error;
        res.status(500).json({ message: 'Error recording payment', error: error.message });
    }
};