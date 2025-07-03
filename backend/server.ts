import express from 'express';
import newsRoutes from './routes/newsRoutes';
import orderRoutes from './routes/orderRoutes';
import paymentRoutes from './routes/paymentRoutes';
import notificationRoutes from './routes/notificationRoutes';
import profileRoutes from './routes/profileRoutes';
import commentRoutes from './routes/commentRoutes';
import reportRoutes from './routes/reportRoutes';
import { db } from './db';
import path from 'path';
import cors from 'cors';
import fs from 'fs';

const app = express();

app.use(express.json());
app.use(cors());

app.use('/uploads', express.static(path.resolve(__dirname, 'uploads')));

app.use('/news', newsRoutes);
app.use('/orders', orderRoutes);
app.use('/notifications', notificationRoutes);
app.use('/profiles', profileRoutes);
app.use('/payment', paymentRoutes);
app.use('/comments', commentRoutes);
app.use('/reports', reportRoutes);

app.get('/', (_req, res) => {
  res.send('API GuardHire działa! 🚀');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
  console.log('UPLOADS DIR EXISTS:', fs.existsSync(path.resolve(__dirname, 'uploads')));
console.log('AUDIO FILE EXISTS:', fs.existsSync(path.resolve(__dirname, 'uploads/audio/1751573131207-325364216.m4a')));
});

export default app;
