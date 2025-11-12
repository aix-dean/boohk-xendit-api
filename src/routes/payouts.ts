import { Router, Request, Response } from 'express';
import { createPayout } from '../services/xendit';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/payouts:
 *   post:
 *     summary: Create a payout
 *     tags: [Payouts]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - currency
 *               - channelCode
 *             properties:
 *               amount:
 *                 type: number
 *                 description: Payout amount
 *               currency:
 *                 type: string
 *                 enum: [IDR, USD, PHP, SGD, MYR]
 *                 description: Currency code
 *               channelCode:
 *                 type: string
 *                 description: Payout channel code
 *               description:
 *                 type: string
 *                 description: Payout description
 *     responses:
 *       200:
 *         description: Payout created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/payouts/{id}:
 *   get:
 *     summary: Get payout by ID
 *     tags: [Payouts]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payout ID
 *     responses:
 *       200:
 *         description: Payout details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payout not found
 */

router.post('/', async (req: Request, res: Response) => {
  try {
    const payoutData = req.body;
    const payout = await createPayout({
      data: payoutData,
      idempotencyKey: req.headers['idempotency-key'] as string || 'default',
    });
    logger.info('Payout created', { id: payout.id });
    res.json(payout);
  } catch (error) {
    logger.error('Payout creation failed', { error });
    res.status(500).json({ error: 'Failed to create payout' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  // TODO: Implement single payout retrieval
  res.json({ message: 'Single payout retrieval - TODO', id: req.params['id'] });
});

export default router;