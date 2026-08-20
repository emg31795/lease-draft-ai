// Best-effort in-memory rate limiter for the standalone Vercel serverless functions
// under /api. There's no shared database or Redis in this project yet, so this can't
// be a perfectly distributed limiter — each warm lambda instance tracks its own
// counters, and a cold start resets them. In practice Vercel reuses warm instances for
// sustained traffic from the same source, so this still meaningfully blocks the obvious
// abuse case (a script hammering /api/generate to run up the Anthropic API bill) without
// any new infrastructure. If real abuse shows up despite this, the proper fix is a
// shared store (Vercel KV / Upstash Redis) or Vercel's edge-level firewall — not a
// bigger in-memory map.

const buckets = new Map();

// Periodically forget old IPs so the map doesn't grow forever across a long-lived
// warm instance.
const MAX_TRACKED_KEYS = 5000;

export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket?.remoteAddress || 'unknown';
}

/**
 * Returns { allowed: boolean, retryAfterSeconds: number } for a fixed-window limit of
 * `max` requests per `windowMs` milliseconds, keyed by `key` (e.g. "generate:1.2.3.4").
 */
export function checkRateLimit(key, { max, windowMs }) {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    if (buckets.size >= MAX_TRACKED_KEYS) {
      buckets.clear();
    }
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  if (existing.count < max) {
    existing.count += 1;
    return { allowed: true, retryAfterSeconds: 0 };
  }

  return { allowed: false, retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000) };
}

export function rateLimitResponse(res, retryAfterSeconds) {
  res.setHeader('Retry-After', String(retryAfterSeconds));
  return res.status(429).json({
    error: 'Too many requests. Please wait a moment and try again.',
  });
}
