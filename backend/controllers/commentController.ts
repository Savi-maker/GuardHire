import { Request, Response } from 'express';
import { db } from '../db';

export const addComment = (req: Request, res: Response) => {
  const { orderId, author, content, rating } = req.body;
  const createdAt = new Date().toISOString();

  db.run(
    `INSERT INTO comments (orderId, author, content, rating, createdAt) VALUES (?, ?, ?, ?, ?)`,
    [orderId, author, content, rating, createdAt],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID });
    }
  );
};

export const getCommentsByOrderId = (req: Request, res: Response) => {
  const { orderId } = req.params;

  db.all(
    `SELECT * FROM comments WHERE orderId = ? ORDER BY createdAt DESC`,
    [orderId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};
