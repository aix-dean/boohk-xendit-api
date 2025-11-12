import { Router, Request, Response } from 'express';
import { createInvoice } from '../services/xendit';
import { logger } from '../utils/logger';
import { idempotency } from '../middleware/idempotency';

const router = Router();

/**
 * @swagger
 * /api/invoices:
 *   post:
 *     summary: Create an invoice
 *     tags: [Invoices]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: header
 *         name: Idempotency-Key
 *         schema:
 *           type: string
 *         description: Optional idempotency key
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - customer
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Invoice amount
 *                 example: 10000
 *               currency:
 *                 type: string
 *                 enum: [IDR, USD, PHP, SGD, MYR]
 *                 description: Currency code
 *                 example: "IDR"
 *               customer:
 *                 type: object
 *                 required:
 *                   - email
 *                 properties:
 *                   email:
 *                     type: string
 *                     format: email
 *                     description: Customer email
 *                   name:
 *                     type: string
 *                     description: Customer name
 *                   mobileNumber:
 *                     type: string
 *                     description: Customer mobile number
 *               description:
 *                 type: string
 *                 description: Invoice description
 *               invoiceDuration:
 *                 type: number
 *                 description: Invoice validity duration in seconds
 *                 default: 86400
 *               items:
 *                 type: array
 *                 description: Invoice items
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     price:
 *                       type: number
 *     responses:
 *       200:
 *         description: Invoice created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

router.post('/', idempotency, async (req: Request, res: Response) => {
  try {
    const invoiceData = req.body;
    const invoice = await createInvoice({
      data: invoiceData,
    });
    logger.info('Invoice created', { id: invoice.id });
    res.json(invoice);
  } catch (error) {
    logger.error('Invoice creation failed', { error });
    res.status(500).json({ error: 'Failed to create invoice' });
  }
});

/**
 * @swagger
 * /api/invoices/{id}:
 *   get:
 *     summary: Get invoice by ID
 *     tags: [Invoices]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Invoice ID
 *     responses:
 *       200:
 *         description: Invoice details
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
 *                 customer:
 *                   type: object
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Invoice not found
 */
router.get('/:id', async (req: Request, res: Response) => {
  // TODO: Implement single invoice retrieval using correct API
  res.json({ message: 'Single invoice retrieval - TODO', id: req.params['id'] });
});

export default router;