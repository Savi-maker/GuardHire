import express from 'express';
import {
  getProfiles,
  addProfile,
  login,
  getMyProfile,
  changeUserRole,
  updateMyProfile,
  uploadAvatar,
  upload,
  checkEmailExists
} from '../controllers/profileController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = express.Router();


router.get('/', getProfiles);
router.post('/', addProfile);
router.post('/login', login);
router.get('/me', authenticateJWT, getMyProfile);
router.patch('/me', authenticateJWT, updateMyProfile);
router.patch('/:id/role', authenticateJWT, requireRole('admin'), changeUserRole);
router.post('/me/avatar', authenticateJWT, upload, uploadAvatar);
router.post('/check-email', checkEmailExists);
export default router;
