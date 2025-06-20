import { db } from '../db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const SECRET = 'super_tajne_haslo';

// Konfiguracja multer do zapisu awatara
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${Date.now()}${ext}`);
  }
});

export const upload = multer({ storage }).single('avatar');

export const getProfiles = (req: Request, res: Response) => {
  db.all(
    'SELECT id, imie, nazwisko, mail, username, numertelefonu, stanowisko, role, avatar FROM profiles',
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

  type DbUser = {
    id: number;
    mail: string;
    haslo: string;
    username: string;
    role: string;
  };

  db.get(
    'SELECT * FROM profiles WHERE mail = ? OR username = ?',
    [identifier, identifier],
    async (err, user: DbUser | undefined) => {
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
    'SELECT id, imie, nazwisko, mail, username, numertelefonu, stanowisko, role, avatar FROM profiles WHERE id = ?',
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
  const allowedRoles = ['admin', 'headuser', 'user','guard'];
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
    console.log(`Zmieniono role usera ${id} na ${role}`);
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


export const uploadAvatar = (req: Request, res: Response): void => {
  const userId = (req as any).user?.userId;
  const file = req.file;

 

  if (!file) {
   
    res.status(400).json({ error: 'Nie przesłano pliku' });
    return;
  }

  const avatarPath = `/uploads/${file.filename}`;
 

  try {
    db.run(
      'UPDATE profiles SET avatar = ? WHERE id = ?',
      [avatarPath, userId],
      function (err) {
        if (err) {
          console.error('[uploadAvatar] Błąd SQL:', err.message);
          res.status(500).json({ error: err.message });
          return;
        }
       
        res.json({ success: true, avatarPath });
      }
    );
  } catch (e: any) {
    console.error('[uploadAvatar] Wyjątek:', e.message);
    res.status(500).json({ error: e.message });
  }
};
export const getGuards = (req: Request, res: Response) => {
  db.all(
    'SELECT id, imie, nazwisko, username, mail, numertelefonu, stanowisko, avatar FROM profiles WHERE role = ?',
    ['guard'],
    (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Błąd pobierania ochroniarzy: ' + err.message });
      }
      res.json(rows);
    }
  );
};

