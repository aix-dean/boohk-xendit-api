import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/webhooks:
 *   post:
 *     summary: Receive webhook events from Xendit
 *     tags: [Webhooks]
 *     parameters:
 *       - in: header
 *         name: x-xendit-signature
 *         schema:
 *           type: string
 *         description: Webhook signature for verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               event:
 *                 type: string
 *                 description: Event type
 *               id:
 *                 type: string
 *                 description: Event ID
 *               data:
 *                 type: object
 *                 description: Event data
 *     responses:
 *       200:
 *         description: Webhook received and verified
 *       400:
 *         description: Invalid webhook
 *       401:
 *         description: Signature verification failed
 *       500:
 *         description: Internal server error
 */

const verifyWebhookSignature = (payload: string, signature: string, secret: string): boolean => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
};

router.post('/', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-xendit-signature'] as string;
    const secret = process.env['XENDIT_WEBHOOK_SECRET'] || '';

    if (!signature || !secret) {
      logger.warn('Webhook signature or secret missing');
      return res.status(400).json({ error: 'Invalid webhook' });
    }

    const payload = JSON.stringify(req.body);
    if (!verifyWebhookSignature(payload, signature, secret)) {
      logger.warn('Webhook signature verification failed');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    const event = req.body;
    // Process event based on type
    logger.info('Webhook verified and received', { event: event.event || 'unknown', id: event.id });

    // TODO: Handle different event types (payment.succeeded, etc.)
    res.json({ received: true });
  } catch (error) {
    logger.error('Webhook processing failed', { error });
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;