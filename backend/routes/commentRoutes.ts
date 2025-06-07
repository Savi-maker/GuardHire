import express from 'express';
import { addComment, getCommentsByOrderId } from '../controllers/commentController';

const router = express.Router();

router.post('/', addComment); 
router.get('/:orderId', getCommentsByOrderId); 

export default router;
