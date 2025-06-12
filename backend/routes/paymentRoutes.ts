import { Router } from 'express';
import { handlePayment, payuNotifyHandler, listPayments, manualPaymentCreate, deleteAllPayments, updatePaymentStatus,confirmedHandler,confirmPayment } from '../controllers/paymentController';

const router = Router();

router.post('/pay', handlePayment);
router.post('/notify', payuNotifyHandler);
router.post('/manual-create', manualPaymentCreate);
router.get('/list', listPayments);
router.delete('/wipe', deleteAllPayments);
router.patch('/:id/confirm', confirmPayment);
router.get('/confirmed', confirmedHandler);

export default router;