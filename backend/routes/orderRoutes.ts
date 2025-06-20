import express from 'express';
import {
  getOrders,
  addOrder,
  getOrderById,
  updateOrder,
  deleteOrder,
  updateOrderStatus,
  getGuards,
  getMyOrders
} from '../controllers/orderController';

const router = express.Router();

router.get('/', getOrders);
router.get('/my', getMyOrders);
router.post('/', addOrder);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);
router.patch('/:id/status', updateOrderStatus);
router.get('/guards', getGuards);
export default router;