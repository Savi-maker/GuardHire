import { Router } from 'express';
import { handlePayment, payuNotifyHandler, listPayments } from '../controllers/paymentController';

const router = Router();

router.post('/pay', handlePayment);
router.post('/notify', payuNotifyHandler);
router.get('/list', listPayments);
export default router;
