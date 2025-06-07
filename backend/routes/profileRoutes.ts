import express from 'express';
import {
  getProfiles,
  addProfile,
  login,
  getMyProfile,
  changeUserRole,
  updateMyProfile // ⬅ dodane
} from '../controllers/profileController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', getProfiles);
router.post('/', addProfile);
router.post('/login', login);
router.patch('/:id/role', authenticateJWT, requireRole('admin'), changeUserRole);
router.get('/me', authenticateJWT, getMyProfile);
router.patch('/me', authenticateJWT, updateMyProfile); // ⬅ nowy endpoint

export default router;
