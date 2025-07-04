import { Request, Response } from 'express';
import { db } from '../db';

export const getReportsByOrder = (req: Request, res: Response) => {
  const { orderId } = req.query;
  if (!orderId) {
    res.status(400).json({ error: 'Brak orderId' });
    return;
  }

  db.all(
    'SELECT * FROM reports WHERE orderId = ? ORDER BY createdAt DESC',
    [orderId],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      const formatted = (rows as any[]).map(row => ({
        ...row,
        photo: row.photo ? row.photo.replace(/\\/g, '/') : null,
        audioNote: row.audioNote ? row.audioNote.replace(/\\/g, '/') : null,
      }));
      res.json(formatted);
    }
  );
};

export const getReports = (req: Request, res: Response) => {
  const { orderId } = req.query;
  let sql = 'SELECT * FROM reports';
  const params: any[] = [];

  if (orderId) {
    sql += ' WHERE orderId = ?';
    params.push(orderId);
  }
  sql += ' ORDER BY createdAt DESC';

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const formatted = (rows as any[]).map(row => ({
      ...row,
      photo: row.photo ? row.photo.replace(/\\/g, '/') : null,
      audioNote: row.audioNote ? row.audioNote.replace(/\\/g, '/') : null,
    }));
    res.json(formatted);
  });
};


export const addReport = (req: Request, res: Response) => {
  const { orderId, guardId, description } = req.body;
  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  const audioNoteRaw = files?.audioNote?.[0]?.path || null;
  const photoRaw = files?.photo?.[0]?.path || null;

  const audioNote = audioNoteRaw ? audioNoteRaw.replace(/\\/g, '/').replace(/^.*uploads[\\/]/, '') : null;
  const photo = photoRaw ? photoRaw.replace(/\\/g, '/').replace(/^.*uploads[\\/]/, '') : null;

  if (!orderId || !guardId) {
    res.status(400).json({ error: 'Brak orderId lub guardId' });
    return;
  }

  db.run(
    `INSERT INTO reports (orderId, guardId, description, audioNote, photo, createdAt)
     VALUES (?, ?, ?, ?, ?, datetime('now'))`,
    [orderId, guardId, description, audioNote, photo],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      db.get('SELECT * FROM reports WHERE id = ?', [this.lastID], (err2, row) => {
        if (err2) {
          res.status(500).json({ error: err2.message });
          return;
        }
        const data = row as any;
        res.json({
          ...data,
          photo: data.photo ? data.photo.replace(/\\/g, '/') : null,
          audioNote: data.audioNote ? data.audioNote.replace(/\\/g, '/') : null,
        });
      });
    }
  );
};

export const getReportsByUser = (req: Request, res: Response) => {
  const { userId } = req.params;
  if (!userId) {
    res.status(400).json({ error: 'Brak userId' });
    return;
  }

  const sql = `
    SELECT reports.*, orders.createdBy, orders.name AS orderName
    FROM reports
    JOIN orders ON reports.orderId = orders.id
    WHERE reports.guardId = ? OR orders.createdBy = ?
    ORDER BY reports.createdAt DESC
  `;

  db.all(sql, [userId, userId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const formatted = (rows as any[]).map(row => ({
      ...row,
      photo: row.photo ? row.photo.replace(/\\/g, '/') : null,
      audioNote: row.audioNote ? row.audioNote.replace(/\\/g, '/') : null,
    }));
    res.json(formatted);
  });
};