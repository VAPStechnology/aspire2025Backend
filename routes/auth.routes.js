// auth.routes.js
import express from 'express';
import { register, login,  logout} from '../controllers/auth.controller.js'; // Correctly import named exports

const router = express.Router();

// Authentication Routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout',logout);

export default router;
