"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xendit_1 = require("../services/xendit");
const logger_1 = require("../utils/logger");
const idempotency_1 = require("../middleware/idempotency");
const paymentTransform_1 = require("../utils/paymentTransform");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a payment request
 *     tags: [Payments]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema:
 *           type: string
 *         description: Optional idempotency key for duplicate prevention
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - payment_method
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in the smallest currency unit
 *                 example: 10000
 *               currency:
 *                 type: string
 *                 enum: [PHP, IDR, USD, SGD, MYR]
 *                 description: Currency code
 *                 example: "PHP"
 *               payment_method:
 *                 type: object
 *                 description: Payment method details in Xendit API format
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [VIRTUAL_ACCOUNT, EWALLET, CARD, DIRECT_DEBIT]
 *                     description: Payment method type
 *                     example: "VIRTUAL_ACCOUNT"
 *                   bankCode:
 *                     type: string
 *                     description: Bank code for virtual account or direct debit
 *                     example: "PH_BPI"
 *                   accountNumber:
 *                     type: string
 *                     description: Account number for direct debit
 *                   ewalletType:
 *                     type: string
 *                     enum: [GCASH, PAYMAYA, GRABPAY, SHOPEEPAY]
 *                     description: E-wallet type
 *                   reusability:
 *                     type: string
 *                     enum: [ONE_TIME_USE, MULTIPLE_USE]
 *                     description: Payment method reusability (for virtual account)
 *                     example: "ONE_TIME_USE"
 *                   cardNumber:
 *                     type: string
 *                     description: Card number for card payments
 *                   expiryMonth:
 *                     type: string
 *                     description: Card expiry month (MM)
 *                   expiryYear:
 *                     type: string
 *                     description: Card expiry year (YYYY)
 *                   cvv:
 *                     type: string
 *                     description: Card CVV
 *                   cardholderName:
 *                     type: string
 *                     description: Cardholder name
 *               customer:
 *                 type: object
 *                 description: Customer information
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: Customer ID
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Customer email
 *                   mobileNumber:
 *                     type: string
 *                     description: Customer mobile number
 *               description:
 *                 type: string
 *                 description: Payment description
 *                 example: "Payment for order #123"
 *               invoiceId:
 *                 type: string
 *                 description: Associated invoice ID
 *               successRedirectUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to redirect on successful payment
 *               failureRedirectUrl:
 *                 type: string
 *                 format: uri
 *                 description: URL to redirect on failed payment
 *               items:
 *                 type: array
 *                 description: List of items being purchased
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *                     category:
 *                       type: string
 *               fees:
 *                 type: array
 *                 description: Additional fees
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     value:
 *                       type: number
 *     responses:
 *       200:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 status:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', idempotency_1.idempotency, async (req, res) => {
    try {
        const paymentData = req.body;
        if (paymentData.paymentMethod) {
            paymentData.paymentMethod = (0, paymentTransform_1.transformPaymentMethod)(paymentData.paymentMethod);
        }
        const payment = await (0, xendit_1.createPaymentRequest)({
            data: paymentData,
        });
        logger_1.logger.info('Payment created', { id: payment.id });
        res.json(payment);
    }
    catch (error) {
        logger_1.logger.error('Payment creation failed', { error });
        res.status(500).json({ error: 'Failed to create payment' });
    }
});
/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment request by ID
 *     tags: [Payments]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment request ID
 *     responses:
 *       200:
 *         description: Payment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 status:
 *                   type: string
 *                 payment_method:
 *                   type: object
 *                 customer:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        if (!id) {
            return res.status(400).json({ error: 'Invalid payment ID' });
        }
        const payment = await (0, xendit_1.getPaymentRequestByID)({
            paymentRequestId: id,
        });
        res.json(payment);
    }
    catch (error) {
        logger_1.logger.error('Payment retrieval failed', { id: req.params['id'], error });
        res.status(404).json({ error: 'Payment not found' });
    }
});
exports.default = router;
//# sourceMappingURL=payments.js.map