"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.payoutClient = exports.refundClient = exports.getPayout = exports.createPayout = exports.getRefund = exports.createRefund = exports.getCustomer = exports.createCustomer = exports.getInvoice = exports.createInvoice = exports.getPaymentRequestByID = exports.createPaymentRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const XENDIT_BASE_URL = 'https://api.xendit.co';
const apiKey = process.env['XENDIT_API_KEY'] || '';
const xenditApi = axios_1.default.create({
    baseURL: XENDIT_BASE_URL,
    auth: {
        username: apiKey,
        password: '',
    },
    headers: {
        'Content-Type': 'application/json',
    },
});
// Payment Request functions
const createPaymentRequest = async (params) => {
    const response = await xenditApi.post('/payment_requests', params.data);
    return response.data;
};
exports.createPaymentRequest = createPaymentRequest;
const getPaymentRequestByID = async (params) => {
    const response = await xenditApi.get(`/payment_requests/${params.paymentRequestId}`);
    return response.data;
};
exports.getPaymentRequestByID = getPaymentRequestByID;
// Invoice functions
const createInvoice = async (params) => {
    const response = await xenditApi.post('/v2/invoices', params.data);
    return response.data;
};
exports.createInvoice = createInvoice;
const getInvoice = async (params) => {
    const response = await xenditApi.get(`/v2/invoices/${params.invoiceId}`);
    return response.data;
};
exports.getInvoice = getInvoice;
// Customer functions
const createCustomer = async (params) => {
    const response = await xenditApi.post('/customers', params.data);
    return response.data;
};
exports.createCustomer = createCustomer;
const getCustomer = async (params) => {
    const response = await xenditApi.get(`/customers/${params.customerId}`);
    return response.data;
};
exports.getCustomer = getCustomer;
const createRefund = async (params) => {
    const response = await xenditApi.post('/refunds', params.data);
    return response.data;
};
exports.createRefund = createRefund;
const getRefund = async (params) => {
    const response = await xenditApi.get(`/refunds/${params.refundID}`);
    return response.data;
};
exports.getRefund = getRefund;
const createPayout = async (params) => {
    const headers = params.idempotencyKey ? { 'Idempotency-Key': params.idempotencyKey } : {};
    const response = await xenditApi.post('/payouts', params.data, { headers });
    return response.data;
};
exports.createPayout = createPayout;
const getPayout = async (params) => {
    const response = await xenditApi.get(`/payouts/${params.payoutID}`);
    return response.data;
};
exports.getPayout = getPayout;
// Placeholder objects for backward compatibility (deprecated)
exports.refundClient = {
    createRefund: exports.createRefund,
    getRefund: exports.getRefund,
};
exports.payoutClient = {
    createPayout: exports.createPayout,
    getPayout: exports.getPayout,
};
//# sourceMappingURL=xendit.js.map