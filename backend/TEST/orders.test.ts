import request from 'supertest';
import app from '../server';

describe('Orders API', () => {
  let newOrderId: number;

  it('POST /orders powinno dodać nowe zlecenie', async () => {
    const res = await request(app).post('/orders').send({
      name: 'Test Zlecenie',
      status: 'nowe',
      date: new Date().toISOString(),
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
    newOrderId = res.body.id;
  });

  it('GET /orders powinno zwrócić listę zleceń', async () => {
    const res = await request(app).get('/orders');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /orders/:id powinno zwrócić zlecenie po ID', async () => {
    const res = await request(app).get(`/orders/${newOrderId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id', newOrderId);
  });
});
