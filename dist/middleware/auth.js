"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
        return res.status(401).json({ error: 'Missing or invalid authorization header' });
    }
    const base64Credentials = authHeader.split(' ')[1];
    if (!base64Credentials) {
        return res.status(401).json({ error: 'Invalid authorization header' });
    }
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [apiKey] = credentials.split(':');
    console.log('Received apiKey:', apiKey);
    console.log('Expected:', process.env['XENDIT_API_KEY']);
    if (!apiKey || apiKey !== process.env['XENDIT_API_KEY']) {
        return res.status(401).json({ error: 'Invalid API key' });
    }
    next();
    return;
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.js.map