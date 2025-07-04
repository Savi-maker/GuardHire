import express from 'express';
import { register, resetPassword, verifyUser } from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/reset-password', resetPassword);
router.post('/verify-user', verifyUser);

export default router;