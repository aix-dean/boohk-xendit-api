import { Router, Request, Response } from 'express';
import { createPaymentRequest, getPaymentRequestByID } from '../services/xendit';
import { logger } from '../utils/logger';
import { idempotency } from '../middleware/idempotency';
import { transformPaymentMethod } from '../utils/paymentTransform';

const router = Router();

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
 *               - paymentMethod
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payment amount in the smallest currency unit
 *                 example: 10000
 *               currency:
 *                 type: string
 *                 enum: [IDR, USD, PHP, SGD, MYR]
 *                 description: Currency code
 *                 example: "IDR"
 *               paymentMethod:
 *                 type: object
 *                 description: Simplified payment method details (transformed internally)
 *                 properties:
 *                   type:
 *                     type: string
 *                     enum: [VIRTUAL_ACCOUNT, EWALLET, CARD, DIRECT_DEBIT]
 *                     description: Payment method type
 *                     example: "VIRTUAL_ACCOUNT"
 *                   bankCode:
 *                     type: string
 *                     description: Bank code for virtual account or direct debit
 *                     example: "BCA"
 *                   accountNumber:
 *                     type: string
 *                     description: Account number for direct debit
 *                   ewalletType:
 *                     type: string
 *                     enum: [DANA, OVO, LINKAJA, GOPAY, SHOPEEPAY]
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
router.post('/', idempotency, async (req: Request, res: Response) => {
  try {
    const paymentData = req.body;
    if (paymentData.paymentMethod) {
      paymentData.paymentMethod = transformPaymentMethod(paymentData.paymentMethod);
      // Add channel_properties for EWALLET or CARD if redirects are provided
      if ((paymentData.paymentMethod.type === 'EWALLET' || paymentData.paymentMethod.type === 'CARD') && paymentData.successRedirectUrl) {
        const channelProps = {
          success_return_url: paymentData.successRedirectUrl,
          failure_return_url: paymentData.failureRedirectUrl,
        };
        if (paymentData.paymentMethod.type === 'EWALLET') {
          paymentData.paymentMethod.ewallet.channel_properties = {
            ...channelProps,
            cancel_return_url: paymentData.failureRedirectUrl, // Use failure URL for cancel
          };
        } else if (paymentData.paymentMethod.type === 'CARD') {
          paymentData.paymentMethod.card.channel_properties = channelProps;
        }
        // Remove top-level redirect URLs as they are not part of Xendit API
        delete paymentData.successRedirectUrl;
        delete paymentData.failureRedirectUrl;
      }
      // Rename to snake_case for Xendit
      paymentData.payment_method = paymentData.paymentMethod;
      delete paymentData.paymentMethod;
    }
    const payment = await createPaymentRequest({
      data: paymentData,
    });
    logger.info('Payment created', { id: payment.id });
    res.json(payment);
  } catch (error) {
    logger.error('Payment creation failed', { message: (error as any).message, status: (error as any).status, xenditError: (error as any).response?.data });
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
 *                 paymentMethod:
 *                   type: object
 *                 customer:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ error: 'Invalid payment ID' });
    }
    const payment = await getPaymentRequestByID({
      paymentRequestId: id,
    });
    res.json(payment);
  } catch (error) {
    logger.error('Payment retrieval failed', { id: req.params['id'], error });
    res.status(404).json({ error: 'Payment not found' });
  }
});

export default router;