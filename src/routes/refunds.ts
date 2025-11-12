import { Router, Request, Response } from 'express';
import { createRefund, getRefund } from '../services/xendit';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/refunds:
 *   post:
 *     summary: Create a refund
 *     tags: [Refunds]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentId
 *               - amount
 *             properties:
 *               paymentId:
 *                 type: string
 *                 description: Payment ID to refund
 *               amount:
 *                 type: number
 *                 description: Refund amount
 *               reason:
 *                 type: string
 *                 description: Refund reason
 *     responses:
 *       200:
 *         description: Refund created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/refunds/{id}:
 *   get:
 *     summary: Get refund by ID
 *     tags: [Refunds]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Refund ID
 *     responses:
 *       200:
 *         description: Refund details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Refund not found
 */

router.post('/', async (req: Request, res: Response) => {
  try {
    const refundData = req.body;
    const refund = await createRefund({
      data: refundData,
    });
    logger.info('Refund created', { id: refund.id });
    res.json(refund);
  } catch (error) {
    logger.error('Refund creation failed', { error });
    res.status(500).json({ error: 'Failed to create refund' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params['id'];
    if (!id) {
      return res.status(400).json({ error: 'Invalid refund ID' });
    }
    // Assuming refundClient has getRefund method
    const refund = await getRefund({
      refundID: id,
    });
    res.json(refund);
  } catch (error) {
    logger.error('Refund retrieval failed', { id: req.params['id'], error });
    res.status(404).json({ error: 'Refund not found' });
  }
});

export default router;