import { RequestHandler } from 'express';
import { db } from '../db';
import { createPayment } from '../services/payu';
import { Request,Response,Router } from 'express';

//DO WERYFIKACJI
export const manualPaymentCreate: RequestHandler = (req: Request, res: Response): void => {
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
   // return res.status(400).json({ error: 'Brakuje danych' });
  }

  db.run(
    'INSERT INTO payments (orderId, amount, status, createdAt) VALUES (?, ?, ?, ?)',
    [orderId, amount, 'pending', new Date().toISOString()],
    function (err) {
      if (err) {
        console.error('Błąd insertu payments:', err.message);
        return res.status(500).json({ error: 'Błąd serwera' });
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

  db.get(
    'SELECT amount FROM payments WHERE id = ?',
    [paymentId],
    async (err, row: { amount: number } | undefined) => {
      if (err) {
        console.error('Błąd bazy danych:', err.message);
        return res.status(500).json({ error: 'Błąd serwera przy odczycie' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Nie znaleziono płatności' });
      }

      const amount = row.amount;
      try {
        const { payuOrderId, redirectUri, extOrderId } = await createPayment(String(amount), email);

        db.run(
          'UPDATE payments SET payuOrderId = ?, extOrderId = ?, updatedAt = datetime("now") WHERE id = ?',
          [payuOrderId, extOrderId, paymentId],
          (err2) => {
            if (err2) {
              console.error('Błąd aktualizacji płatności:', err2.message);
              return res.status(500).json({ error: 'Błąd zapisu danych PayU' });
            }
            return res.json({ redirectUri });
          }
        );
      } catch (e: any) {
        console.error('Błąd przy tworzeniu płatności:', e);
        return res.status(500).json({ error: 'Błąd płatności' });
      }
    }
  );
};


export const payuNotifyHandler: RequestHandler = (req, res) => {
  const { orderId, status } = req.body;

  db.run(
    "UPDATE payments SET status = ?, updatedAt = datetime('now') WHERE payuOrderId = ?",
    [status, orderId],
    (err) => {
      if (err) console.error("Błąd webhooka PayU:", err.message);
    }
  );

  res.send("OK");
};
const router = Router();

export const listPayments: RequestHandler = (req, res) => {
  db.all('SELECT payments.*, orders.name as orderName FROM payments left join orders on payments.orderId = orders.id ORDER BY payments.createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Błąd przy pobieraniu payments:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    res.json(rows);
  });
};

export default router;



export const deleteAllPayments: RequestHandler = (req, res) => {
  db.run('DELETE FROM payments', (err) => {
    if (err) {
      console.error('Błąd przy czyszczeniu payments:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    res.json({ success: true });
  });
};
export const updatePaymentStatus = (extOrderId: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    db.run(
      "UPDATE payments SET status = 'completed', updatedAt = datetime('now') WHERE extOrderId = ?",
      [extOrderId],
      function (err) {
        if (err) return reject(err);
        resolve();
      }
    );
  });
};


