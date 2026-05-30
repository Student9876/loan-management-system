import { Router } from 'express';
import { uploadSalarySlip } from '../controllers/loan.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// Endpoint expects a form-data field named 'file'
router.post('/upload-slip', verifyToken, upload.single('file'), uploadSalarySlip);

export default router;