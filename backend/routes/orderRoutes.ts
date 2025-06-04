import express from 'express';
import {
  getOrders,
  addOrder,
  getOrderById,
  updateOrder,
  deleteOrder
} from '../controllers/orderController';

const router = express.Router();

router.get('/', getOrders);
router.post('/', addOrder);
router.get('/:id', getOrderById);
router.put('/:id', updateOrder);
router.delete('/:id', deleteOrder);

export default router;