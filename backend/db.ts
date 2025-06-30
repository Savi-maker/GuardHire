import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';

export const db = new sqlite3.Database('./mydb.sqlite3');

db.serialize(() => {

  // ---------- NEWS ----------

  db.run(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT
    )
  `);

  // ---------- NOTIFICATIONS ----------

  db.run(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      description TEXT,
      type TEXT DEFAULT 'info',
      created_at TEXT DEFAULT (datetime('now')),
      read INTEGER DEFAULT 0  
    )
  `);

  // ---------- PROFILES ----------

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
      role TEXT DEFAULT 'user',
      avatar TEXT
    )
  `);
  
  // ---------- GUARDS_DETAILS ----------
  db.run(`
    CREATE TABLE IF NOT EXISTS guards_details (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE,
      lokalizacja TEXT,
      plec TEXT,
      lata_doswiadczenia INTEGER,
      specjalnosci TEXT,
      licencja_bron INTEGER,
      opinia INTEGER,
      FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE
    )
  `);
 
// ---------- ORDERS ----------

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    status TEXT,
    date TEXT,
    opis TEXT,
    lat REAL,
    lng REAL,
    paymentStatus TEXT DEFAULT 'unpaid',
    createdBy INTEGER,
    assignedGuard INTEGER
  )
`);

 // ---------- PAYMENTS----------
db.run(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId TEXT,
    amount INTEGER,
    status TEXT DEFAULT 'pending',
    payuOrderId TEXT,
    extOrderId TEXT,
    createdAt TEXT DEFAULT (datetime('now')),
    updatedAt TEXT DEFAULT (datetime('now'))
  )
`);
  // ---------- DEFAULT ORDERS ----------

  db.get('SELECT COUNT(*) as count FROM orders', [], (err, row) => {
    if (err) {
      console.error('Błąd przy sprawdzaniu orders:', err.message);
    } else if ((row as { count: number }).count === 0) {
      const stmt = db.prepare('INSERT INTO orders (name, status, date) VALUES (?, ?, ?)');
      const defaultOrders = [
        { name: 'Zlecenie 1', status: 'nowe', date: new Date().toISOString() },
        { name: 'Zlecenie 2', status: 'w trakcie', date: new Date().toISOString() },
        { name: 'Zlecenie 3', status: 'zakończone', date: new Date().toISOString() },
      ];
      defaultOrders.forEach(order => {
        stmt.run(order.name, order.status, order.date);
      });
      stmt.finalize();
      console.log('Dodano domyślne zlecenia');
    }
  });
});

const defaultUsers = [
  {
    imie: 'Admin',
    nazwisko: 'Systemowy',
    username: 'admin',
    mail: 'admin@guardhire.pl',
    numertelefonu: '123456789',
    stanowisko: 'Administrator',
    haslo: 'admin123',
    role: 'admin',
    avatar: null
  },
  {
    imie: 'Marek',
    nazwisko: 'Szefowski',
    username: 'headuser',
    mail: 'headuser@guardhire.pl',
    numertelefonu: '500222333',
    stanowisko: 'Kierownik',
    haslo: 'headuser123',
    role: 'headuser',
    avatar: null
  },
  {
    imie: 'Jan',
    nazwisko: 'Kowalski',
    username: 'janek',
    mail: 'janek@guardhire.pl',
    numertelefonu: '500111222',
    stanowisko: 'Pracownik',
    haslo: 'janek123',
    role: 'user',
    avatar: null  
  },
  {
    imie: 'Katarzyna',
    nazwisko: 'Nowak',
    username: 'kaska',
    mail: 'kaska@guardhire.pl',
    numertelefonu: '500333444',
    stanowisko: 'Ochroniarz',
    haslo: 'kaska123',
    role: 'guard',
    avatar: null
  }
];
const guards = [
    {
      imie: 'Anna', nazwisko: 'Nowak', username: 'anowan', mail: 'anna@guardhire.pl',
      numertelefonu: '501234567', stanowisko: 'Ochroniarz', haslo: 'anna123', role: 'guard', avatar: null,
      lokalizacja: 'Warszawa', plec: 'K', lata_doswiadczenia: 3, specjalnosci: 'imprezy masowe, ochrona VIP', licencja_bron: 1, opinia: 9
    },
    {
      imie: 'Marek', nazwisko: 'Górski', username: 'mgorski', mail: 'marek.gorski@guardhire.pl',
      numertelefonu: '502345678', stanowisko: 'Ochroniarz', haslo: 'marek123', role: 'guard', avatar: null,
      lokalizacja: 'Kraków', plec: 'M', lata_doswiadczenia: 7, specjalnosci: 'konwojowanie, ochrona VIP', licencja_bron: 1, opinia: 10
    },
    {
      imie: 'Katarzyna', nazwisko: 'Lis', username: 'klis', mail: 'k.lis@guardhire.pl',
      numertelefonu: '503456789', stanowisko: 'Ochroniarz', haslo: 'kasia123', role: 'guard', avatar: null,
      lokalizacja: 'Poznań', plec: 'K', lata_doswiadczenia: 5, specjalnosci: 'ochrona imprez', licencja_bron: 0, opinia: 8
    },
    {
      imie: 'Piotr', nazwisko: 'Sokołowski', username: 'psokol', mail: 'piotr.sokol@guardhire.pl',
      numertelefonu: '504567890', stanowisko: 'Ochroniarz', haslo: 'piotr123', role: 'guard', avatar: null,
      lokalizacja: 'Wrocław', plec: 'M', lata_doswiadczenia: 4, specjalnosci: 'monitoring, ochrona obiektów', licencja_bron: 1, opinia: 8
    },
    {
      imie: 'Julia', nazwisko: 'Borowska', username: 'jborowska', mail: 'julia.borowska@guardhire.pl',
      numertelefonu: '505678901', stanowisko: 'Ochroniarz', haslo: 'julia123', role: 'guard', avatar: null,
      lokalizacja: 'Gdańsk', plec: 'K', lata_doswiadczenia: 2, specjalnosci: 'ochrona imprez, monitoring', licencja_bron: 0, opinia: 7
    },
    {
      imie: 'Tomasz', nazwisko: 'Zieliński', username: 'tzielinski', mail: 'tomasz.zielinski@guardhire.pl',
      numertelefonu: '506789012', stanowisko: 'Ochroniarz', haslo: 'tomek123', role: 'guard', avatar: null,
      lokalizacja: 'Łódź', plec: 'M', lata_doswiadczenia: 6, specjalnosci: 'ochrona obiektów, konwojowanie', licencja_bron: 1, opinia: 9
    },
    {
      imie: 'Ewa', nazwisko: 'Wysocka', username: 'ewysocka', mail: 'ewa.wysocka@guardhire.pl',
      numertelefonu: '507890123', stanowisko: 'Ochroniarz', haslo: 'ewa123', role: 'guard', avatar: null,
      lokalizacja: 'Katowice', plec: 'K', lata_doswiadczenia: 8, specjalnosci: 'monitoring, ochrona imprez', licencja_bron: 0, opinia: 10
    },
    {
      imie: 'Marcin', nazwisko: 'Grabowski', username: 'mgrabowski', mail: 'marcin.grabowski@guardhire.pl',
      numertelefonu: '508901234', stanowisko: 'Ochroniarz', haslo: 'marcin123', role: 'guard', avatar: null,
      lokalizacja: 'Lublin', plec: 'M', lata_doswiadczenia: 2, specjalnosci: 'ochrona VIP, monitoring', licencja_bron: 1, opinia: 7
    },
    {
      imie: 'Natalia', nazwisko: 'Pawlak', username: 'npawlak', mail: 'natalia.pawlak@guardhire.pl',
      numertelefonu: '509012345', stanowisko: 'Ochroniarz', haslo: 'natalia123', role: 'guard', avatar: null,
      lokalizacja: 'Szczecin', plec: 'K', lata_doswiadczenia: 3, specjalnosci: 'ochrona obiektów', licencja_bron: 0, opinia: 8
    },
    {
      imie: 'Paweł', nazwisko: 'Kowalczyk', username: 'pkowalczyk', mail: 'pawel.kowalczyk@guardhire.pl',
      numertelefonu: '510123456', stanowisko: 'Ochroniarz', haslo: 'pawel123', role: 'guard', avatar: null,
      lokalizacja: 'Bydgoszcz', plec: 'M', lata_doswiadczenia: 5, specjalnosci: 'konwojowanie, ochrona VIP', licencja_bron: 1, opinia: 9
    }
  ];

  guards.forEach(async (user) => {
    db.get('SELECT * FROM profiles WHERE username = ?', [user.username], async (err, existingUser) => {
      if (!existingUser) {
        const hashedPassword = await bcrypt.hash(user.haslo, 10);
        db.run(
          'INSERT INTO profiles (imie, nazwisko, username, mail, numertelefonu, stanowisko, haslo, role, avatar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [
            user.imie, user.nazwisko, user.username, user.mail, user.numertelefonu, user.stanowisko, hashedPassword, user.role, user.avatar
          ],
          function (err2) {
            if (!err2) {
              const userId = this.lastID;
              db.run(
                'INSERT OR IGNORE INTO guards_details (user_id, lokalizacja, plec, lata_doswiadczenia, specjalnosci, licencja_bron, opinia) VALUES (?, ?, ?, ?, ?, ?, ?)',
                [userId, user.lokalizacja, user.plec, user.lata_doswiadczenia, user.specjalnosci, user.licencja_bron, user.opinia]
              );
            }
          }
        );
      }
    });
  });


defaultUsers.forEach((user) => {
  db.get('SELECT * FROM profiles WHERE username = ?', [user.username], async (err, existingUser) => {
    if (!existingUser) {
      const hashedPassword = await bcrypt.hash(user.haslo, 10);
      db.run(
        'INSERT INTO profiles (imie, nazwisko, username, mail, numertelefonu, stanowisko, haslo, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          user.imie,
          user.nazwisko,
          user.username,
          user.mail,
          user.numertelefonu,
          user.stanowisko,
          hashedPassword,
          user.role
        ],
        (err) => {
          if (err) {
            console.error(`Błąd przy dodawaniu użytkownika ${user.username}:`, err.message);
          } else {
            console.log(`Dodano domyślnego użytkownika: ${user.username}`);
          }
        }
      );
    }
  });
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

// ---------- COMMENTS ----------
db.run(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    author TEXT,
    content TEXT,
    rating INTEGER,
    createdAt TEXT DEFAULT (datetime('now'))
  )
`);

// ---------- NOTIFICATIONS ----------

const notifications = [
  {
    title: 'Nowe szkolenie BHP',
    description: 'Zapisz się na obowiązkowe szkolenie BHP, które odbędzie się w najbliższy piątek.',
    type: 'info',
  },
  {
    title: 'Zmiana godzin pracy',
    description: 'Przypominamy o zmianie godzin pracy w ten weekend. Sprawdź swój grafik!',
    type: 'alert',
  },
];

db.get('SELECT COUNT(*) as count FROM notifications', [], (err, row) => {
  if (err) {
    console.error('Błąd przy sprawdzaniu notifications:', err.message);
  } else if ((row as { count: number } | undefined)?.count === 0) {
    const stmt = db.prepare('INSERT INTO notifications (title, description, type) VALUES (?, ?, ?)');
    notifications.forEach(n => {
      stmt.run(n.title, n.description, n.type);
    });
    stmt.finalize();
    console.log('Dodano przykładowe powiadomienia');
  }
});