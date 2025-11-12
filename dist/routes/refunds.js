"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const xendit_1 = require("../services/xendit");
const logger_1 = require("../utils/logger");
const router = (0, express_1.Router)();
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
router.post('/', async (req, res) => {
    try {
        const refundData = req.body;
        const refund = await (0, xendit_1.createRefund)({
            data: refundData,
        });
        logger_1.logger.info('Refund created', { id: refund.id });
        res.json(refund);
    }
    catch (error) {
        logger_1.logger.error('Refund creation failed', { error });
        res.status(500).json({ error: 'Failed to create refund' });
    }
});
router.get('/:id', async (req, res) => {
    try {
        const id = req.params['id'];
        if (!id) {
            return res.status(400).json({ error: 'Invalid refund ID' });
        }
        // Assuming refundClient has getRefund method
        const refund = await (0, xendit_1.getRefund)({
            refundID: id,
        });
        res.json(refund);
    }
    catch (error) {
        logger_1.logger.error('Refund retrieval failed', { id: req.params['id'], error });
        res.status(404).json({ error: 'Refund not found' });
    }
});
exports.default = router;
//# sourceMappingURL=refunds.js.map