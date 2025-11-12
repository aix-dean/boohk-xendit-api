import request from 'supertest';
import app from '../index';

// Mock Xendit services
jest.mock('../services/xendit', () => ({
  paymentClient: {
    createPaymentRequest: jest.fn().mockResolvedValue({
      id: 'payment_123',
      amount: 10000,
      currency: 'IDR',
      status: 'PENDING'
    }),
    getPaymentRequestByID: jest.fn().mockResolvedValue({
      id: 'payment_123',
      amount: 10000,
      currency: 'IDR',
      status: 'PENDING'
    })
  }
}));

describe('Payments API', () => {
  it('should create a payment with valid auth', async () => {
    const apiKey = process.env['XENDIT_API_KEY'] || 'test_key';
    const response = await request(app)
      .post('/api/payments')
      .set('Authorization', 'Basic ' + Buffer.from(apiKey + ':').toString('base64'))
      .send({
        amount: 10000,
        currency: 'IDR',
        paymentMethod: {
          type: 'VIRTUAL_ACCOUNT',
          bankCode: 'BCA',
          reusability: 'ONE_TIME_USE'
        }
      });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 'payment_123');
  });

  it('should reject without auth', async () => {
    const response = await request(app)
      .post('/api/payments')
      .send({});
    expect(response.status).toBe(401);
  });
});