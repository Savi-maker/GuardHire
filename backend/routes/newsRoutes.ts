import express from 'express';
import { getNews, addNews, editNews, deleteNews } from '../controllers/newsController';

const router = express.Router();
router.get('/', getNews);
router.post('/', addNews);
router.put('/:id', editNews);
router.delete('/:id', deleteNews);

export default router;