import axios, { AxiosInstance } from 'axios';

const XENDIT_BASE_URL = 'https://api.xendit.co';
const apiKey = process.env['XENDIT_API_KEY'] || '';

const xenditApi: AxiosInstance = axios.create({
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
export const createPaymentRequest = async (params: { data: any }) => {
  const response = await xenditApi.post('/payment_requests', params.data);
  return response.data;
};

export const getPaymentRequestByID = async (params: { paymentRequestId: string }) => {
  const response = await xenditApi.get(`/payment_requests/${params.paymentRequestId}`);
  return response.data;
};

// Invoice functions
export const createInvoice = async (params: { data: any }) => {
  const response = await xenditApi.post('/v2/invoices', params.data);
  return response.data;
};

export const getInvoice = async (params: { invoiceId: string }) => {
  const response = await xenditApi.get(`/v2/invoices/${params.invoiceId}`);
  return response.data;
};

// Customer functions
export const createCustomer = async (params: { data: any }) => {
  const response = await xenditApi.post('/customers', params.data);
  return response.data;
};

export const getCustomer = async (params: { customerId: string }) => {
  const response = await xenditApi.get(`/customers/${params.customerId}`);
  return response.data;
};

export const createRefund = async (params: { data: any }) => {
  const response = await xenditApi.post('/refunds', params.data);
  return response.data;
};

export const getRefund = async (params: { refundID: string }) => {
  const response = await xenditApi.get(`/refunds/${params.refundID}`);
  return response.data;
};

export const createPayout = async (params: { data: any; idempotencyKey?: string }) => {
  const headers = params.idempotencyKey ? { 'Idempotency-Key': params.idempotencyKey } : {};
  const response = await xenditApi.post('/payouts', params.data, { headers });
  return response.data;
};

export const getPayout = async (params: { payoutID: string }) => {
  const response = await xenditApi.get(`/payouts/${params.payoutID}`);
  return response.data;
};

// Placeholder objects for backward compatibility (deprecated)
export const refundClient = {
  createRefund,
  getRefund,
};

export const payoutClient = {
  createPayout,
  getPayout,
};