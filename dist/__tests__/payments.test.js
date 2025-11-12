"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../index"));
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
        const response = await (0, supertest_1.default)(index_1.default)
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
        const response = await (0, supertest_1.default)(index_1.default)
            .post('/api/payments')
            .send({});
        expect(response.status).toBe(401);
    });
});
//# sourceMappingURL=payments.test.js.map