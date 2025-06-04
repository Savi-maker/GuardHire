import express from 'express';
import { getProfiles, addProfile, login, getMyProfile } from '../controllers/profileController';
import { authenticateJWT } from '../middleware/auth';

const router = express.Router();

router.get('/', getProfiles);
router.post('/', addProfile);
router.post('/login', login);

router.get('/me', authenticateJWT, getMyProfile);

export default router;
