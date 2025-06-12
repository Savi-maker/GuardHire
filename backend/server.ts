import express from 'express';
import newsRoutes from './routes/newsRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import profileRoutes from './routes/profileRoutes';
import commentRoutes from './routes/commentRoutes';
import { db } from './db';
import path from 'path';
import cors from 'cors';

const app = express();



// Middleware
app.use(express.json());
app.use(cors());


app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

// Trasy
app.use('/news', newsRoutes);
app.use('/orders', orderRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profiles', profileRoutes);
app.use('/payment', paymentRoutes);
app.use('/comments', commentRoutes);


app.get('/', (_req, res) => {
  res.send('API GuardHire działa! 🚀');
});

// Uruchomienie serwera
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});