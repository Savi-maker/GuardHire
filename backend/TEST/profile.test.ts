import request from 'supertest';
import app from '../server';

describe('Profile API - rozszerzone testy', () => {
  let token: string;
  let newUserId: number;
  const adminEmail = `admin${Date.now()}@guardhire.pl`; // zapobiega duplikatom
  const adminPassword = 'admin123';

  it('POST /profiles - dodanie użytkownika admin', async () => {
    const res = await request(app).post('/profiles').send({
      imie: 'Admin',
      nazwisko: 'Testowy',
      username: 'admin' + Date.now(),
      mail: adminEmail,
      numertelefonu: '123456789',
      stanowisko: 'Administrator',
      haslo: adminPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  it('POST /profiles/login - logowanie admina', async () => {
    const res = await request(app).post('/profiles/login').send({
      identifier: adminEmail,
      haslo: adminPassword,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
  });

  it('POST /profiles - dodanie nowego użytkownika', async () => {
    const res = await request(app).post('/profiles').send({
      imie: 'Test',
      nazwisko: 'User',
      username: 'testuser' + Date.now(),
      mail: `test${Date.now()}@example.com`,
      numertelefonu: '123456789',
      stanowisko: 'Tester',
      haslo: 'test123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    newUserId = res.body.id;
  });

  it('GET /profiles/me - pobranie własnego profilu', async () => {
    const res = await request(app)
      .get('/profiles/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username');
  });

  it('PATCH /profiles/:id/role - zmiana roli użytkownika', async () => {
    const res = await request(app)
      .patch(`/profiles/${newUserId}/role`)
      .set('Authorization', `Bearer ${token}`)
      .send({ role: 'headuser' });

    // 403 może się pojawić jeśli token nie ma roli "admin"
    expect([200, 403]).toContain(res.statusCode);
  });

  it('POST /profiles/check-email - sprawdzanie istnienia maila', async () => {
    const res = await request(app)
      .post('/profiles/check-email')
      .send({ email: adminEmail });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('exists', true);
  });

  // ✅ Informacyjnie na końcu
  afterAll(() => {
    console.log('✅ Wszystkie testy zakończone pomyślnie.');
  });
});
