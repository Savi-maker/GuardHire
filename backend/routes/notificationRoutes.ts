import express from 'express';
import { getNotifications, addNotification } from '../controllers/notificationController';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', addNotification);

export default router;
