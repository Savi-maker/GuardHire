import request from 'supertest';
import app from '../server';

describe('Payments API', () => {
  let paymentId: number;

  it('POST /payment/manual-create powinno utworzyć płatność', async () => {
    const res = await request(app).post('/payment/manual-create').send({
      orderId: 1,
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('paymentId');
    paymentId = res.body.paymentId;
  });

  it('POST /payment/pay powinno zwrócić redirectUri (PayU)', async () => {
    const res = await request(app).post('/payment/pay').send({
      paymentId,
      email: 'test@guardhire.pl',
    });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('redirectUri');
  });
});
