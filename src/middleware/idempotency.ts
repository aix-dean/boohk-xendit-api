import { Request, Response, NextFunction } from 'express';

interface CachedResponse {
  status: number;
  body: any;
  headers: Record<string, string>;
}

const cache = new Map<string, CachedResponse>();

export const idempotency = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['idempotency-key'] as string;

  if (!key) {
    return next(); // No key, proceed normally
  }

  if (cache.has(key)) {
    const cached = cache.get(key)!;
    res.status(cached.status).json(cached.body);
    return;
  }

  // Store original send method
  const originalSend = res.send;
  const originalJson = res.json;
  const originalStatus = res.status;

  let responseBody: any;
  let responseStatus = 200;

  res.status = (code: number) => {
    responseStatus = code;
    return originalStatus.call(res, code);
  };

  res.send = (body: any) => {
    responseBody = body;
    return originalSend.call(res, body);
  };

  res.json = (body: any) => {
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