import { Router } from 'express';
import { handlePayment, payuNotifyHandler } from '../controllers/paymentController';

const router = Router();

router.post('/pay', handlePayment);
router.post('/notify', payuNotifyHandler);

export default router;
