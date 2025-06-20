import { db } from '../db';
import { Request, Response } from 'express';

export const getOrders = (req: Request, res: Response) => {
  const userId = Number(req.query.userId);
  const role = req.query.role;

  let query = 'SELECT * FROM orders';
  let params: any[] = [];

  if (role === 'guard' && userId) {
    query += ' WHERE assignedGuard = ?';
    params = [userId];
  } else if (role === 'user' && userId) {
    query += ' WHERE createdBy = ?';
    params = [userId];
  } // admin widzi wszystko

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};


export const getMyOrders = (req: Request, res: Response) => {
  const userId = Number(req.query.userId);
  if (!userId) {
    res.status(400).json({ error: 'Brak userId w zapytaniu' });
    return;
  }

  db.all(
    'SELECT * FROM orders WHERE createdBy = ?',
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
};

export const addOrder = (req: Request, res: Response) => {
  const { name, status, date, opis, lat, lng, paymentStatus, createdBy, assignedGuard } = req.body;

  db.run(
    `INSERT INTO orders (name, status, date, opis, lat, lng, paymentStatus, createdBy, assignedGuard)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      status,
      date,
      opis,
      lat,
      lng,
      paymentStatus || 'unpaid',
      createdBy,
      assignedGuard
    ],
    function (err) {
      if (err) {
        console.error('SQL Błąd:', err.message);
        res.status(500).json({ success: false, error: err.message });
        return;
      }
      res.json({
        success: true,
        id: this.lastID,
        name,
        status,
        date,
        opis,
        lat,
        lng,
        paymentStatus: paymentStatus || 'unpaid',
        createdBy,
        assignedGuard
      });
    }
  );
};

export const getOrderById = (req: Request, res: Response) => {
  const { id } = req.params;

  const query = `
    SELECT 
      orders.*,
      profiles.imie || ' ' || profiles.nazwisko AS assignedGuardName
    FROM orders
    LEFT JOIN profiles ON orders.assignedGuard = profiles.id
    WHERE orders.id = ?
  `;

  db.get(query, [id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Nie znaleziono zlecenia' });
      return;
    }
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
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Nie znaleziono zlecenia' });
        return;
      }
      res.json({ id, name, status, date });
    }
  );
};

export const deleteOrder = (req: Request, res: Response) => {
  const { id } = req.params;

  db.run('DELETE FROM orders WHERE id = ?', [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Nie znaleziono zlecenia' });
      return;
    }
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

  db.run(
    'UPDATE orders SET status = ? WHERE id = ?',
    [status, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Nie znaleziono zlecenia' });
        return;
      }
      res.json({ success: true });
    }
  );
};

export const getGuards = (req: Request, res: Response) => {
  db.all(
    'SELECT id, imie, nazwisko, username FROM profiles WHERE role = ?',
    ['guard'],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
};
