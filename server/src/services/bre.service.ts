export interface BreParams {
    dob: string;
    monthlySalary: number;
    employmentMode: string;
    pan: string;
}

export interface BreResult {
    passed: boolean;
    errors: string[];
}

export const executeBre = (data: BreParams): BreResult => {
    const errors: string[] = [];
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    // Age Calculation
    const birthDate = new Date(data.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    // Rule Valuations
    if (age < 23 || age > 50) {
        errors.push('Age must be between 23 and 50.');
    }

    if (data.monthlySalary < 25000) {
        errors.push('Monthly salary must be at least 25,000.');
    }

    if (!panRegex.test(data.pan)) {
        errors.push('Invalid PAN format.');
    }

    if (data.employmentMode === 'Unemployed') {
        errors.push('Applicant cannot be Unemployed.');
    }

    return {
        passed: errors.length === 0,
        errors
    };
};