import { Request, Response } from 'express';
import cloudinary from '../config/cloudinary';

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