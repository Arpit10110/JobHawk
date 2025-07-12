import express from 'express';
import { SendMail } from '../controller/Controller.js';
import { submitjobform } from '../controller/jobform.js';

const router = express.Router();

router.get('/', (req, res) => {
    return res.status(200).json({
        success: true,
        message: 'Welcome to the Job Application Backend API',
    });
});

router.get('/send-email', SendMail)

// routes to create a job form
router.post('/createjobform',submitjobform)

export default router;