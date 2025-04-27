import express from 'express';
import { 
  getUsers, 
  blockUser, 
  deleteUser, 
  unblockUser 
} from '../controllers/admin.controller.js';

import {
  getAllForms,
  getFormsByUserId,
  updateForm,
  deleteForm,
  getFormsByUser,
  getFormStatsByUserId
} from '../controllers/form.controller.js';

import protect from '../middleware/authMiddleware.js';
import adminOnly from '../middleware/adminOnly.js';

const router = express.Router();

// User Management
router.get('/users', protect, adminOnly, getUsers);
router.patch('/users/:id/block', protect, adminOnly, blockUser);
router.patch('/users/:id/unblock', protect, adminOnly, unblockUser);
router.delete('/users/:id/delete', protect, adminOnly, deleteUser);

// Form Management (Admin)
router.get('/forms', protect, adminOnly, getAllForms);                 // Get all forms
router.get('/forms/:id', protect, adminOnly, getFormsByUserId);              // Get single form by ID
router.put('/forms/:id/update', protect, adminOnly, updateForm);               // Update a form
router.delete('/forms/:id/delete', protect, adminOnly, deleteForm);            // Delete a form
router.get('/forms/user/:userId', protect, adminOnly, getFormsByUser);  // Get all forms of specific user
router.get('/forms/stats/:id', protect, adminOnly, getFormStatsByUserId); // Get form stats for specific user

export default router;
