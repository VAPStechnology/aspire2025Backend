import express from 'express';
import { 
  sendOtp, 
  uploadDocuments, 
  verifyOtp 
} from '../controllers/user.controller.js';

import {
  createForm,
  updateForm,
  submitForm,
  getFormsByUser,
  getFormStatsByUserId,
  getFormsByUserId
} from '../controllers/form.controller.js';

import protect from '../middleware/authMiddleware.js';
// import upload from '../middleware/upload.js';
import checkEmailVerified from '../middleware/checkEmailVerified.js';

const router = express.Router();

// OTP & Document Upload
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
// router.post(
//   '/upload',
//   upload.fields([
//     { name: 'aadhaar', maxCount: 1 },
//     { name: 'photo', maxCount: 1 },
//     { name: 'signature', maxCount: 1 },
//   ]),
//   checkEmailVerified,
//   uploadDocuments
// );
router.post('/upload',checkEmailVerified,uploadDocuments);

// Form Routes (User)
router.post('/forms', protect, createForm);                         // Create new form
router.get('/forms/:id', protect, getFormsByUserId);                      // Get form by ID
router.put('/forms/:id/update', protect, updateForm);                       // Update form
router.patch('/forms/:id/submit', protect, submitForm);              // Submit form
router.get('/my-forms', protect, getFormsByUser);                    // Get all forms of logged-in user
router.get('/my-forms/stats/:id', protect, getFormStatsByUserId); // Get form stats (submitted/left)

export default router;
