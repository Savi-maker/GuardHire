import express from 'express';
import { getNotifications, addNotification,patchNotification  } from '../controllers/notificationController';

const router = express.Router();

router.get('/', getNotifications);
router.post('/', addNotification);
router.patch('/:id/read', patchNotification);

export default router;
