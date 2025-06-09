import { RequestHandler } from 'express';
import { db } from '../db';
import { createPayment } from '../services/payu';
import { Router } from 'express';
export const handlePayment: RequestHandler = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Brakuje emaila" });
    return;
  }

  try {
    const { payuOrderId, redirectUri, extOrderId } = await createPayment(email);

    db.run(
      "INSERT INTO payments (orderId, amount, status, payuOrderId, extOrderId) VALUES (?, ?, ?, ?, ?)",
      [extOrderId, 15.0, "pending", payuOrderId, extOrderId]
    );

    res.json({ redirectUri });
  } catch (err: any) {
    console.error("Błąd przy tworzeniu płatności:", err);
    res.status(500).json({ error: "Błąd płatności" });
  }
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
  db.all('SELECT * FROM payments ORDER BY createdAt DESC', [], (err, rows) => {
    if (err) {
      console.error('Błąd przy pobieraniu payments:', err.message);
      return res.status(500).json({ error: 'Błąd serwera' });
    }
    res.json(rows);
  });
};

export default router;