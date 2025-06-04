import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

export const db = new sqlite3.Database('./mydb.sqlite3');

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


const defaultAdmin = {
  imie: 'Admin',
  nazwisko: 'Systemowy',
  username: 'admin',
  mail: 'admin@guardhire.pl',
  numertelefonu: '123456789',
  stanowisko: 'Administrator',
  haslo: 'admin123', 
  role: 'admin'
};

db.get('SELECT * FROM profiles WHERE username = ?', [defaultAdmin.username], async (err, user) => {
  if (!user) {
    const hashedPassword = await bcrypt.hash(defaultAdmin.haslo, 10);
    db.run(
      'INSERT INTO profiles (imie, nazwisko, username, mail, numertelefonu, stanowisko, haslo, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        defaultAdmin.imie,
        defaultAdmin.nazwisko,
        defaultAdmin.username,
        defaultAdmin.mail,
        defaultAdmin.numertelefonu,
        defaultAdmin.stanowisko,
        hashedPassword,
        defaultAdmin.role
      ],
      (err) => {
        if (err) {
          console.error('Błąd przy dodawaniu admina:', err.message);
        } else {
          console.log('Dodano domyślnego admina');
        }
      }
    );
  }
});




// ---------- NEWS ----------
const news = [
  {
    title: 'Nowe zlecenie dostępne',
    description: 'Sprawdź nowe zlecenie w Twoim rejonie. Zarób dodatkowe środki już dziś!',
  },
  {
    title: 'Aktualizacja aplikacji',
    description: 'Wersja 2.0 już dostępna. Sprawdź nowe funkcje i ulepszenia.',
  },
  {
    title: 'Bezpieczeństwo',
    description:
      'Przypomnienie o zasadach bezpieczeństwa podczas pracy. Twoje zdrowie jest najważniejsze.',
  },
];

db.get('SELECT COUNT(*) as count FROM news', [], (err, row) => {
  if (err) {
    console.error('Błąd przy sprawdzaniu newsów:', err.message);
  } else if ((row as { count: number }).count === 0) {
    const stmt = db.prepare('INSERT INTO news (title, description) VALUES (?, ?)');
    news.forEach(n => {
      stmt.run(n.title, n.description);
    });
    stmt.finalize();
    console.log('Dodano domyślne newsy');
  }
});


