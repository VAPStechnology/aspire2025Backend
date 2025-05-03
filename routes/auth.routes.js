// auth.routes.js
import express from 'express';
import { register, login,  logout, verifyToken} from '../controllers/auth.controller.js'; // Correctly import named exports
import protect from '../middleware/authMiddleware.js';


const router = express.Router();

// Authentication Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout',protect,logout);
router.get('/verifyToken', verifyToken); // Route to verify token validity

export default router;
