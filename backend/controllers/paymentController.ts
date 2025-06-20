import { RequestHandler } from 'express';
import { db } from '../db';
import { createPayment } from '../services/payu';
import { Request, Response, Router } from 'express';

export const manualPaymentCreate: RequestHandler = (req, res) => {
  const { orderId } = req.body;
  if (!orderId) {
    res.status(400).json({ error: 'Brakuje danych' });
    return;
  }

  db.run(
    'INSERT INTO payments (orderId, amount, status, createdAt) VALUES (?, ?, ?, ?)',
    [orderId, 1500, 'pending', new Date().toISOString()],
    function (err) {
      if (err) {
        console.error('Błąd insertu payments:', err.message);
        res.status(500).json({ error: 'Błąd serwera' });
        return;
      }
      res.json({ success: true, paymentId: this.lastID });
    }
  );
};

export const handlePayment: RequestHandler = (req, res) => {
  const { paymentId, email } = req.body;
  if (!paymentId || !email) {
    res.status(400).json({ error: 'Brakuje paymentId lub emaila' });
    return;
  }

  db.get('SELECT amount FROM payments WHERE id = ?', [paymentId], async (err, row: { amount: number } | undefined) => {
    if (err) {
      console.error('Błąd bazy danych:', err.message);
      res.status(500).json({ error: 'Błąd serwera przy odczycie' });
      return;
    }
    if (!row) {
      res.status(404).json({ error: 'Nie znaleziono płatności' });
      return;
    }

    try {
      const { payuOrderId, redirectUri, extOrderId } = await createPayment(String(row.amount), email);
      db.run(
        'UPDATE payments SET payuOrderId = ?, extOrderId = ?, updatedAt = datetime("now") WHERE id = ?',
        [payuOrderId, extOrderId, paymentId],
        (err2) => {
          if (err2) {
            console.error('Błąd aktualizacji płatności:', err2.message);
            res.status(500).json({ error: 'Błąd zapisu danych PayU' });
            return;
          }
          res.json({ redirectUri });
        }
      );
    } catch (e) {
      console.error('Błąd przy tworzeniu płatności:', e);
      res.status(500).json({ error: 'Błąd płatności' });
    }
  });
};

export const payuNotifyHandler: RequestHandler = (req, res) => {
  const { orderId, status } = req.body;
  db.run(
    "UPDATE payments SET status = ?, updatedAt = datetime('now') WHERE payuOrderId = ?",
    [status, orderId],
    (err) => {
      if (err) {
        console.error("Błąd webhooka PayU:", err.message);
      }
    }
  );
  res.send("OK");
};

export const listPayments: RequestHandler = (req, res) => {
  const userId = Number(req.query.userId);
  const role = req.query.role as string;

  if (!userId || !role) {
    res.status(400).json({ error: 'Brak danych użytkownika' });
    return;
  }

  if (role === 'admin') {
  // wszystko
  db.all(
    `SELECT payments.*, orders.name as orderName 
     FROM payments 
     LEFT JOIN orders ON payments.orderId = orders.id 
     ORDER BY payments.createdAt DESC`,
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Błąd serwera' });
        return;
      }
      res.json(rows);
    }
  );
} else if (role === 'guard') {
  db.all(
    `SELECT payments.*, orders.name as orderName 
     FROM payments 
     LEFT JOIN orders ON payments.orderId = orders.id 
     WHERE orders.assignedGuard = ? 
     ORDER BY payments.createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Błąd serwera' });
        return;
      }
      res.json(rows);
    }
  );
} else if (role === 'user') {
  db.all(
    `SELECT payments.*, orders.name as orderName 
     FROM payments 
     LEFT JOIN orders ON payments.orderId = orders.id 
     WHERE orders.createdBy = ? 
     ORDER BY payments.createdAt DESC`,
    [userId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: 'Błąd serwera' });
        return;
      }
      res.json(rows);
    }
  );
} else {
  res.status(403).json({ error: 'Brak uprawnień' });
}
};



export const deleteAllPayments: RequestHandler = (req, res) => {
  db.run('DELETE FROM payments', (err) => {
    if (err) {
      console.error('Błąd przy czyszczeniu payments:', err.message);
      res.status(500).json({ error: 'Błąd serwera' });
      return;
    }
    res.json({ success: true });
  });
};

export const updatePaymentStatus = (extOrderId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT orderId FROM payments WHERE extOrderId = ?', [extOrderId], (err, row: { orderId: number } | undefined) => {
      if (err) return reject(err);
      if (!row) return reject(new Error(`Nie znaleziono płatności dla extOrderId=${extOrderId}`));

      const orderId = row.orderId;
      db.run(
        "UPDATE payments SET status = 'completed', updatedAt = datetime('now') WHERE extOrderId = ?",
        [extOrderId],
        (err2) => {
          if (err2) return reject(err2);

          db.run(
            "UPDATE orders SET paymentStatus = 'opłacono', status = 'w trakcie' WHERE id = ?",
            [orderId],
            (err3) => {
              if (err3) return reject(err3);
              resolve();
            }
          );
        }
      );
    });
  });
};

export const updatePaymentStatusByID = (id: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.get('SELECT orderId FROM payments WHERE id = ?', [id], (err, row: { orderId: number } | undefined) => {
      if (err) return reject(err);
      if (!row) return reject(new Error(`Nie znaleziono płatności dla ID=${id}`));

      const orderId = row.orderId;
      db.run(
        "UPDATE payments SET status = 'completed', updatedAt = datetime('now') WHERE id = ?",
        [id],
        (err2) => {
          if (err2) return reject(err2);

          db.run(
            "UPDATE orders SET paymentStatus = 'opłacono', status = 'w trakcie' WHERE id = ?",
            [orderId],
            (err3) => {
              if (err3) return reject(err3);
              resolve();
            }
          );
        }
      );
    });
  });
};

export const confirmedHandler: RequestHandler = async (req, res) => {
  const extOrderId = req.query.extOrderId as string;
  try {
    await updatePaymentStatus(extOrderId);
    res.send(`
      <html>
        <head><title>Płatność potwierdzona</title></head>
        <body style="font-family: sans-serif; text-align: center; padding-top: 80px;">
          <h1>Płatność potwierdzona</h1>
          <p>Dziękujemy za opłatę.<br>Możesz wrócić do aplikacji.</p>
        </body>
      </html>
    `);
  } catch (err) {
    console.error('Błąd w confirmedHandler:', err);
    res.status(500).send("Wystąpił błąd przy potwierdzeniu płatności.");
  }
};

export const confirmPayment: RequestHandler = (req, res) => {
  const paymentId = req.params.id;
  db.get('SELECT id FROM payments WHERE id = ?', [paymentId], async (err, row: { id: string } | undefined) => {
    if (err || !row) {
      console.error('Nie znaleziono płatności lub błąd DB:', err?.message);
      res.status(404).json({ error: 'Płatność nie istnieje' });
      return;
    }

    try {
      await updatePaymentStatusByID(row.id);
      res.json({ success: true });
    } catch (e) {
      console.error('Błąd zatwierdzania płatności:', e);
      res.status(500).json({ error: 'Błąd zatwierdzania płatności' });
    }
  });
};

const router = Router();
export default router;
