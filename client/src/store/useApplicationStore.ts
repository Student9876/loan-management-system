import { create } from 'zustand';

interface PersonalDetails {
    fullName: string;
    pan: string;
    dob: string;
    monthlySalary: number | '';
    employmentMode: 'Salaried' | 'Self-Employed' | 'Unemployed' | '';
}

interface LoanConfig {
    amount: number;
    tenure: number;
    interestRate: number;
}

interface ApplicationState {
    personalDetails: PersonalDetails;
    salarySlipUrl: string;
    loanConfig: LoanConfig;
    setPersonalDetails: (details: Partial<PersonalDetails>) => void;
    setSalarySlipUrl: (url: string) => void;
    setLoanConfig: (config: Partial<LoanConfig>) => void;
    resetApplication: () => void;
}

const initialPersonalDetails: PersonalDetails = {
    fullName: '',
    pan: '',
    dob: '',
    monthlySalary: '',
    employmentMode: '',
};

const initialLoanConfig: LoanConfig = {
    amount: 50000,
    tenure: 30,
    interestRate: 12,
};

export const useApplicationStore = create<ApplicationState>((set) => ({
    personalDetails: initialPersonalDetails,
    salarySlipUrl: '',
    loanConfig: initialLoanConfig,

    setPersonalDetails: (details) =>
        set((state) => ({
            personalDetails: { ...state.personalDetails, ...details },
        })),

    setSalarySlipUrl: (url) => set({ salarySlipUrl: url }),

    setLoanConfig: (config) =>
        set((state) => ({
            loanConfig: { ...state.loanConfig, ...config },
        })),

    resetApplication: () =>
        set({
            personalDetails: initialPersonalDetails,
            salarySlipUrl: '',
            loanConfig: initialLoanConfig,
        }),
}));