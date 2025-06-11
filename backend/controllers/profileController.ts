import { db } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';

const SECRET = 'super_tajne_haslo';

export const getProfiles = (req: Request, res: Response) => {
  db.all(
    'SELECT id, imie, nazwisko, mail, username, numertelefonu, stanowisko, role FROM profiles',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
};

export const addProfile = async (req: Request, res: Response) => {
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
};

export const login = (req: Request, res: Response) => {
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
};

export const getMyProfile = (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  db.get(
    'SELECT id, imie, nazwisko, mail, username, numertelefonu, stanowisko, role FROM profiles WHERE id = ?',
    [userId],
    (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!user) return res.status(404).json({ error: 'Nie znaleziono profilu' });
      res.json(user);
    }
  );
};

export const changeUserRole = (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  const allowedRoles = ['admin', 'headuser', 'user'];
  if (!allowedRoles.includes(role)) {
    res.status(400).json({ error: 'Nieprawidłowa rola' });
    return;
  }
  db.run('UPDATE profiles SET role = ? WHERE id = ?', [role, id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Nie znaleziono użytkownika' });
      return;
    }
    res.json({ success: true, id, role });
  });
};

export const updateMyProfile = (req: Request, res: Response) => {
  const userId = (req as any).user?.userId;
  const { imie, nazwisko, mail, numertelefonu } = req.body;

  if (!imie || !nazwisko || !mail || !numertelefonu) {
    res.status(400).json({ error: 'Wszystkie pola są wymagane' });
    return;
  }

  db.run(
    'UPDATE profiles SET imie = ?, nazwisko = ?, mail = ?, numertelefonu = ? WHERE id = ?',
    [imie, nazwisko, mail, numertelefonu, userId],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      if (this.changes === 0) {
        res.status(404).json({ error: 'Nie znaleziono użytkownika' });
        return;
      }
      res.json({ success: true });
    }
  );
};

export const checkEmailExists = (req: Request, res: Response) => {
    const { email } = req.body;

    db.get(
        'SELECT id FROM profiles WHERE mail = ?',
        [email],
        (err, row) => {
            if (err) {
                res.status(500).json({
                    exists: false,
                    error: 'Błąd podczas sprawdzania emaila'
                });
                return;
            }

            res.json({ exists: !!row });
        }
    );
};
