import express from 'express';
import { getNews, addNews } from '../controllers/newsController';

const router = express.Router();
router.get('/', getNews);
router.post('/', addNews);

export default router;