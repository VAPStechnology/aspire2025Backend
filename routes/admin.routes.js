import express from 'express';
import { 
  getUsers, 
  blockUser, 
  deleteUser, 
  unblockUser,
  clearLoginLogs,
  clearLoginLogsAdmin,
  getFormsByUserId,
  deleteFormByUserId,
  getContactUsByUserId,
  getAllContactUs,
  deleteContactUsByUserId,
  getUserRegisterRequest,
  deleteUserRegisterRequest
} from '../controllers/admin.controller.js';

import {
  getAllForms,
  getFormsByUserId as getFormById,
  updateForm,
  deleteForm,
  getFormsByUser,
  getFormStatsByUserId
} from '../controllers/form.controller.js';

import protect from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

const router = express.Router();

// -------------------- User Management --------------------
router.get('/users', protect, adminOnly, getUsers);
router.patch('/users/:id/block', protect, adminOnly, blockUser);
router.patch('/users/:id/unblock', protect, adminOnly, unblockUser);
router.delete('/users/:id/delete', protect, adminOnly, deleteUser);

// -------------------- Form Management (Admin) --------------------
router.get('/forms', protect, adminOnly, getAllForms);                     // Get all forms
router.get('/forms/:id', protect, adminOnly, getFormById);                 // Get single form by ID
router.put('/forms/:id/update', protect, adminOnly, updateForm);           // Update a form
router.delete('/forms/:id/delete', protect, adminOnly, deleteForm);        // Delete a form
router.get('/forms/user/:userId', protect, adminOnly, getFormsByUser);     // Get all forms of specific user
router.get('/forms/stats/:id', protect, adminOnly, getFormStatsByUserId);  // Get form stats for specific user

// -------------------- Additional Admin Routes --------------------

// Clear Login Logs
router.patch('/users/:id/clear-login-logs', protect, adminOnly, clearLoginLogs);

// Contact Us Management
router.get('/contact-messages', protect, adminOnly, getAllContactUs);                  // Get all messages
router.get('/contact-messages/user/:id', protect, adminOnly, getContactUsByUserId);    // Get by user
router.delete('/contact-messages/:id/delete', protect, adminOnly, deleteContactUsByUserId); // Delete message

// User Registration Requests
router.get('/user-register-requests', protect, adminOnly, getUserRegisterRequest);            // Get unapproved users
router.delete('/user-register-requests/:id/delete', protect, adminOnly, deleteUserRegisterRequest); // Delete request

export default router;
