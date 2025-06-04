import { db } from '../db';
import { Request, Response } from 'express';

export const getNotifications = (req: Request, res: Response) => {
  db.all('SELECT * FROM notifications', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export const addNotification = (req: Request, res: Response) => {
  const { title, description } = req.body;
  db.run('INSERT INTO notifications (title, description) VALUES (?, ?)', [title, description], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, description });
  });
};
