import { db } from '../db';
import { Request, Response } from 'express';

export const getNotifications = (req: Request, res: Response) => {
  db.all('SELECT * FROM notifications ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export const addNotification = (req: Request, res: Response) => {
  const { title, description, type = 'info' } = req.body;
  db.run(
    'INSERT INTO notifications (title, description, type) VALUES (?, ?, ?)',
    [title, description, type],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        id: this.lastID,
        title,
        description,
        type,
        created_at: new Date().toISOString(),
        read: 0,
      });
    }
  );
};

export const patchNotification = (req: Request, res: Response) => {
  const { id } = req.params;
  db.run('UPDATE notifications SET read = 1 WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Nie znaleziono powiadomienia' });
    res.json({ success: true });
  });
};