import express from 'express';
import {
  getProfiles,
  addProfile,
  login,
  getMyProfile,
  changeUserRole,
  updateMyProfile
} from '../controllers/profileController';
import { register } from '../controllers/authController';
import { authenticateJWT, requireRole } from '../middleware/auth';

const router = express.Router();

router.get('/', getProfiles);
router.post('/', addProfile);
router.post('/register', (req, res, next) => {
  register(req, res).catch(next);
});
router.post('/login', login);
router.patch('/:id/role', authenticateJWT, requireRole('admin'), changeUserRole);
router.get('/me', authenticateJWT, getMyProfile);
router.patch('/me', authenticateJWT, updateMyProfile);

export default router;