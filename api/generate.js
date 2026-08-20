import { generateNotice } from '../lib/generateNotice.js';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../lib/rateLimit.js';

// Free preview endpoint, called from the wizard before checkout. Returns only a
// truncated preview so the full document is never sent to the browser pre-payment.
// Rate-limited because every call costs a real Anthropic API call regardless of whether
// the customer ever pays.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(`generate:${ip}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) {
    return rateLimitResponse(res, retryAfterSeconds);
  }

  try {
    const fullText = await generateNotice(req.body || {});
    const previewLines = fullText.split('\n').slice(0, 6).join('\n');
    const previewText = `${previewLines}\n\n[... DOCUMENT LOCKED - COMPLETE $9 PAYMENT TO UNLOCK FULL PRINTABLE PDF ...]`;

    return res.status(200).json({ previewText });
  } catch (error) {
    console.error('generate error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Internal Server Error' });
  }
}
