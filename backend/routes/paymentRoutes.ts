import { Router } from 'express';
import { handlePayment, payuNotifyHandler, listPayments, manualPaymentCreate, deleteAllPayments, updatePaymentStatus } from '../controllers/paymentController';

const router = Router();

router.post('/pay', handlePayment);
router.post('/notify', payuNotifyHandler);
router.post('/manual-create', manualPaymentCreate);
router.get('/list', listPayments);
router.delete('/wipe', deleteAllPayments);
router.get('/confirmed', async (req, res) => {
  const extOrderId = req.query.extOrderId as string;
  try {
    await updatePaymentStatus(extOrderId);
    res.send("Płatność potwierdzona, możesz wrócić do aplikacji.");
  } catch (err) {
    res.status(500).send("Wystąpił błąd przy potwierdzeniu płatności.");
  }
});

export default router;
