import { Router } from 'express';
import { handlePayment, payuNotifyHandler, listPayments, manualPaymentCreate, deleteAllPayments } from '../controllers/paymentController';

const router = Router();

router.post('/pay', handlePayment);
router.post('/notify', payuNotifyHandler);
router.post('/manual-create', manualPaymentCreate);
router.get('/list', listPayments);
router.delete('/wipe', deleteAllPayments);
export default router;
