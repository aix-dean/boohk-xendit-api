import { Router, Request, Response } from 'express';
import { createCustomer } from '../services/xendit';
import { logger } from '../utils/logger';

const router = Router();

/**
 * @swagger
 * /api/customers:
 *   post:
 *     summary: Create a customer
 *     tags: [Customers]
 *     security:
 *       - basicAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referenceId:
 *                 type: string
 *                 description: Customer reference ID
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Customer email
 *               mobileNumber:
 *                 type: string
 *                 description: Customer mobile number
 *               description:
 *                 type: string
 *                 description: Customer description
 *     responses:
 *       200:
 *         description: Customer created successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *     security:
 *       - basicAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID
 *     responses:
 *       200:
 *         description: Customer details
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Customer not found
 */

router.post('/', async (req: Request, res: Response) => {
  try {
    const customerData = req.body;
    const customer = await createCustomer({
      data: customerData,
    });
    logger.info('Customer created', { id: customer.id });
    res.json(customer);
  } catch (error) {
    logger.error('Customer creation failed', { error });
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  // TODO: Implement single customer retrieval
  res.json({ message: 'Single customer retrieval - TODO', id: req.params['id'] });
});

export default router;