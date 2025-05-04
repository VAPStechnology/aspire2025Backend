import express from 'express';
import { getAgreementsByUserId, submitAgreement } from '../controllers/agreement.controller.js';
// import { isAuthenticated } from '../middlewares/auth.middleware.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/submit-agreement', protect, submitAgreement);
 router.get('/get-agreements/:id', protect, getAgreementsByUserId);

export default router;
