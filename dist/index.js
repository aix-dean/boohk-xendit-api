"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
console.log('XENDIT_API_KEY loaded:', process.env['XENDIT_API_KEY'] ? 'YES' : 'NO');
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const logger_1 = require("./utils/logger");
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const payments_1 = __importDefault(require("./routes/payments"));
const invoices_1 = __importDefault(require("./routes/invoices"));
const refunds_1 = __importDefault(require("./routes/refunds"));
const payouts_1 = __importDefault(require("./routes/payouts"));
const customers_1 = __importDefault(require("./routes/customers"));
const webhooks_1 = __importDefault(require("./routes/webhooks"));
const app = (0, express_1.default)();
const PORT = process.env['PORT'] || 3000;
// Security middleware
app.use((0, helmet_1.default)());
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
});
app.use(limiter);
// Body parsing
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
const swaggerSpec = (0, swagger_jsdoc_1.default)(swaggerOptions);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
// Logging middleware
app.use((req, res, next) => {
    logger_1.logger.info(`${req.method} ${req.url}`, {
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
app.use('/api', auth_1.authenticate);
// Routes
app.use('/api/payments', payments_1.default);
app.use('/api/invoices', invoices_1.default);
app.use('/api/refunds', refunds_1.default);
app.use('/api/payouts', payouts_1.default);
app.use('/api/customers', customers_1.default);
app.use('/api/webhooks', webhooks_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});
app.listen(PORT, () => {
    logger_1.logger.info(`Server running on port ${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map