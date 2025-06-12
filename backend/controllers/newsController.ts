import { db } from '../db';

// @ts-ignore
export const getNews = (req, res) => {
  db.all('SELECT * FROM news', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
};
// @ts-ignore
export const addNews = (req, res) => {
  const { title, description } = req.body;
  db.run('INSERT INTO news (title, description) VALUES (?, ?)', [title, description], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, description });
  });
};
// @ts-ignore
export const editNews = (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  db.run(
    'UPDATE news SET title = ?, description = ? WHERE id = ?',
    [title, description, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id, title, description });
    }
  );
};
// @ts-ignore
export const deleteNews = (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM news WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'News został usunięty.' });
  });
};