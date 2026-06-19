import mongoose, { Schema, Document } from 'mongoose';

interface IPayment {
    utr: string;
    amount: number;
    date: Date;
}

const PaymentSchema = new mongoose.Schema({
    utr: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

export interface ILoan extends Document {
    borrowerId: mongoose.Types.ObjectId;
    pan: string;
    dob: Date;
    monthlySalary: number;
    employmentMode: 'Salaried' | 'Self-Employed' | 'Unemployed';
    salarySlipUrl: string;
    amount: number;
    tenure: number;
    interestRate: number;
    status: 'Lead' | 'Applied' | 'Sanctioned' | 'Rejected' | 'Disbursed' | 'Closed';
    rejectionReason?: string;
    totalRepayment: number;
    outstandingBalance: number;
    payments: IPayment[];
}

const LoanSchema: Schema = new Schema({
    borrowerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pan: { type: String, required: true, uppercase: true },
    dob: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentMode: {
        type: String,
        enum: ['Salaried', 'Self-Employed', 'Unemployed'],
        required: true
    },
    salarySlipUrl: { type: String },
    amount: { type: Number },
    tenure: { type: Number },
    interestRate: { type: Number, default: 12 },
    status: {
        type: String,
        enum: ['Lead', 'Applied', 'Sanctioned', 'Rejected', 'Disbursed', 'Closed'],
        default: 'Lead'
    },
    payments: { type: [PaymentSchema], default: [] },
    rejectionReason: { type: String },
    totalRepayment: { type: Number },
    outstandingBalance: { type: Number }
}, { timestamps: true });

export default mongoose.model<ILoan>('Loan', LoanSchema);