"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idempotency = void 0;
const cache = new Map();
const idempotency = (req, res, next) => {
    const key = req.headers['idempotency-key'];
    if (!key) {
        return next(); // No key, proceed normally
    }
    if (cache.has(key)) {
        const cached = cache.get(key);
        res.status(cached.status).json(cached.body);
        return;
    }
    // Store original send method
    const originalSend = res.send;
    const originalJson = res.json;
    const originalStatus = res.status;
    let responseBody;
    let responseStatus = 200;
    res.status = (code) => {
        responseStatus = code;
        return originalStatus.call(res, code);
    };
    res.send = (body) => {
        responseBody = body;
        return originalSend.call(res, body);
    };
    res.json = (body) => {
        responseBody = body;
        return originalJson.call(res, body);
    };
    // After response is sent, cache it
    res.on('finish', () => {
        if (responseStatus < 400) { // Only cache successful responses
            cache.set(key, {
                status: responseStatus,
                body: responseBody,
                headers: {},
            });
            // Expire after 24 hours
            setTimeout(() => cache.delete(key), 24 * 60 * 60 * 1000);
        }
    });
    next();
};
exports.idempotency = idempotency;
//# sourceMappingURL=idempotency.js.map