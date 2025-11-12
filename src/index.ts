import 'dotenv/config';
console.log('XENDIT_API_KEY loaded:', process.env['XENDIT_API_KEY'] ? 'YES' : 'NO');
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';
import paymentRoutes from './routes/payments';
import invoiceRoutes from './routes/invoices';
import refundRoutes from './routes/refunds';
import payoutRoutes from './routes/payouts';
import customerRoutes from './routes/customers';
import webhookRoutes from './routes/webhooks';

const app = express();
const PORT = process.env['PORT'] || 3000;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Boohk Xendit API',
      version: '1.0.0',
      description: 'API for integrating with Xendit payment gateway',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        basicAuth: {
          type: 'http',
          scheme: 'basic',
        },
      },
    },
    security: [
      {
        basicAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    userAgent: req.headers['user-agent'],
    ip: req.ip,
  });
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication for API routes
app.use('/api', authenticate);

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/payouts', payoutRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/webhooks', webhookRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app;