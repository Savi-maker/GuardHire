import express from 'express';
import newsRoutes from './routes/newsRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes'
import notificationRoutes from './routes/notificationRoutes';
import profileRoutes from './routes/profileRoutes';
import commentRoutes from './routes/commentRoutes';
import { db } from './db';

const app = express();
app.use(express.json());


app.use('/news', newsRoutes);
app.use('/orders', orderRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profiles', profileRoutes);
app.use('/payment', paymentRoutes)


app.get('/', (_req, res) => {
  res.send('API GuardHire działa! 🚀');
});

// START SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
export default app;
