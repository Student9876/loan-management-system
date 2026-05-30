import { Router } from 'express';
import { uploadSalarySlip, applyForLoan, getDashboardLoans, updateLoanStatus } from '../controllers/loan.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/rbac.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Borrower Application Endpoints
router.post('/upload-slip', verifyToken, requireRole(['Borrower']), upload.single('file'), uploadSalarySlip);
router.post('/apply', verifyToken, requireRole(['Borrower']), applyForLoan);

// Dashboard Endpoints
router.get('/dashboard', verifyToken, requireRole(['Sales', 'Sanction', 'Disbursement', 'Collection', 'Admin']), getDashboardLoans);
router.patch('/:id/status', verifyToken, requireRole(['Sanction', 'Disbursement', 'Admin']), updateLoanStatus);

export default router;