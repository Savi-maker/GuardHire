import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const db = new sqlite3.Database('./mydb.sqlite3');
const SECRET = 'super_tajne_haslo';
app.use(express.json());

// Utwórz tabele jeśli nie istnieją
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT
    )
  `);
  db.run(`
  CREATE TABLE IF NOT EXISTS profiles (
     id INTEGER PRIMARY KEY AUTOINCREMENT,
     imie TEXT,
     nazwisko TEXT,
     username TEXT UNIQUE,
     mail TEXT UNIQUE,
     numertelefonu TEXT,
     stanowisko TEXT,
     haslo TEXT,
     role TEXT DEFAULT 'user'
  )
`);
  db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    status TEXT,
    date TEXT
  )
`);
});

// NEWS ENDPOINTS
app.get('/news', (req, res) => {
  db.all('SELECT * FROM news', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/news', (req, res) => {
  const { title, description } = req.body;
  db.run('INSERT INTO news (title, description) VALUES (?, ?)', [title, description], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, description });
  });
});

// ORDERS ENDPOINTS
app.get('/orders', (req, res) => {
  db.all('SELECT * FROM orders', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/orders', (req, res) => {
  const { name, status, date } = req.body;
  db.run(
    'INSERT INTO orders (name, status, date) VALUES (?, ?, ?)',
    [name, status, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, status, date });
    }
  );
});
app.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM orders WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Nie znaleziono zlecenia' });
    res.json(row);
  });
});
app.put('/orders/:id', (req, res) => {
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
});
app.delete('/orders/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM orders WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Nie znaleziono zlecenia' });
    res.json({ success: true });
  });
});

// NOTIFICATIONS ENDPOINTS
app.get('/notifications', (req, res) => {
  db.all('SELECT * FROM notifications', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/notifications', (req, res) => {
  const { title, description } = req.body;
  db.run('INSERT INTO notifications (title, description) VALUES (?, ?)', [title, description], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ id: this.lastID, title, description });
  });
});

// PROFILES ENDPOINTS
app.get('/profiles', (req, res) => {
  db.all('SELECT id, imie, nazwisko, mail, numertelefonu, stanowisko FROM profiles', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});
app.post('/profiles', async (req, res) => {
  const { imie, nazwisko, username, mail, numertelefonu, stanowisko, haslo } = req.body;
  const hashedPassword = await bcrypt.hash(haslo, 10);
  const role = 'user';
  db.run(
    'INSERT INTO profiles (imie, nazwisko, username, mail, numertelefonu, stanowisko, haslo, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [imie, nazwisko, username, mail, numertelefonu, stanowisko, hashedPassword, role],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, imie, nazwisko, username, mail, numertelefonu, stanowisko, role });
    }
  );
});

app.post('/login', (req, res) => {
  const { identifier, haslo } = req.body; 
  db.get(
    'SELECT * FROM profiles WHERE mail = ? OR username = ?',
    [identifier, identifier],
    async (err, user: { id: number, mail: string, haslo: string, username: string, role: string } | undefined) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(401).json({ error: 'Nieprawidłowy email/username lub hasło' });

      const isMatch = await bcrypt.compare(haslo, user.haslo);
      if (!isMatch) return res.status(401).json({ error: 'Nieprawidłowy email/username lub hasło' });

      const token = jwt.sign(
        {
          userId: user.id,
          mail: user.mail,
          username: user.username,
          role: user.role 
        },
        SECRET,
        { expiresIn: '8h' }
      );
      res.json({ message: 'Zalogowano poprawnie', token });
    }
  );
});

// @ts-ignore
// Tylko admin może usuwać zlecenie:
app.delete('/orders/:id', authenticateJWT, requireRole('admin'), (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM orders WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Nie znaleziono zlecenia' });
    res.json({ success: true });
  });
});

// @ts-ignore
// Tylko admin lub headuser mogą dodać zlecenie:
app.post('/orders', authenticateJWT, requireRoles(['admin', 'headuser']), (req, res) => {
  const { name, status, date } = req.body;
  db.run(
    'INSERT INTO orders (name, status, date) VALUES (?, ?, ?)',
    [name, status, date],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, status, date });
    }
  );
});

function requireRole(role: string) {
  return (req: any, res: express.Response, next: express.NextFunction) => {
    if (!req.user || req.user.role !== role) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    next();
  };
}

function requireRoles(roles: string[]) {
  return (req: any, res: express.Response, next: express.NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Brak uprawnień' });
    }
    next();
  };
}

function authenticateJWT(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET, (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      // @ts-ignore
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Przykładowy endpoint zabezpieczony JWT (np. pobieranie profilu zalogowanego)
app.get('/me', authenticateJWT, (req: any, res) => {
  // req.user.userId masz z tokena!
  db.get('SELECT id, imie, nazwisko, mail, numertelefonu, stanowisko FROM profiles WHERE id = ?', [req.user.userId], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Nie znaleziono profilu' });
    res.json(user);
  });
});

// START SERVER
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Serwer działa na porcie ${PORT}`);
});
