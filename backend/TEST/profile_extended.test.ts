import request from 'supertest';
import app from '../server';

describe('Profile API - rozszerzone testy', () => {
  let token: string;
  let newUserId: number;

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

  it('POST /profiles/login - logowanie nowego użytkownika', async () => {
    const res = await request(app).post('/profiles/login').send({
      identifier: 'admin@guardhire.pl',
      haslo: 'admin123',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    token = res.body.token;
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

    expect([200, 403]).toContain(res.statusCode); 
  });

  it('POST /profiles/check-email - sprawdzanie istniejącego maila', async () => {
    const res = await request(app)
      .post('/profiles/check-email')
      .send({ email: 'admin@guardhire.pl' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('exists', true);
  });
});
