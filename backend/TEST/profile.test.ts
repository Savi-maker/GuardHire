import request from 'supertest';
import app from '../server';

describe('Profile API', () => {
  it('GET /profiles powinno zwrócić listę użytkowników', async () => {
    const res = await request(app).get('/profiles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toHaveProperty('username');
  });

  it('POST /profiles/login poprawne dane powinno zwrócić token', async () => {
    const res = await request(app)
      .post('/profiles/login')
      .send({
        identifier: 'admin@guardhire.pl',
        haslo: 'admin123',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /profiles/login błędne dane powinno zwrócić 401', async () => {
    const res = await request(app)
      .post('/profiles/login')
      .send({
        identifier: 'admin@guardhire.pl',
        haslo: 'zlehaslo',
      });
    expect(res.statusCode).toBe(401);
  });
});
