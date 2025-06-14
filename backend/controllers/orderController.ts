import { db } from '../db';
import { Request, Response } from 'express';

export const getOrders = (req: Request, res: Response) => {
  db.all('SELECT * FROM orders', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};

export const addOrder = (req: Request, res: Response) => {
  const { name, status, date, opis, lat, lng, paymentStatus } = req.body;
console.log('BODY:', req.body);
  db.run(
    `INSERT INTO orders (name, status, date, opis, lat, lng, paymentStatus)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, status, date, opis, lat, lng, paymentStatus || 'unpaid'],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, status, date, opis, lat, lng, paymentStatus: paymentStatus || 'unpaid' });
    }
  );
  console.log("BODY:", req.body);
};


export const getOrderById = (req: Request, res: Response) => {
  const { id } = req.params;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Nie znaleziono zlecenia' });
    res.json(row);
  });
};

export const updateOrder = (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, status, date } = req.body;
  db.run(
    'UPDATE orders SET name = ?, status = ?, date = ? WHERE id = ?',
    [name, status, date, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Nie znaleziono zlecenia' });
      res.json({ id, name, status, date });
    }
  );
};

export const deleteOrder = (req: Request, res: Response) => {
  const { id } = req.params;
  db.run('DELETE FROM orders WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Nie znaleziono zlecenia' });
    res.json({ success: true });
  });
};
export const updateOrderStatus = (req: Request, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
   res.status(400).json({ error: 'Brak statusu' });
   return;
  }

  db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Nie znaleziono zlecenia' });
    res.json({ success: true });
  });
};