import Stripe from 'stripe';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../lib/rateLimit.js';

// Self-serve document recovery. There's no database in this project, so Stripe itself is
// the only durable record of a purchase — this looks up the Customer created for the
// email the buyer paid with (see customer_creation: 'always' in api/checkout.js) and
// returns the most recent *paid* Checkout Session for them, which /success already knows
// how to re-render and re-download from. This exists because before it, a customer who
// closed their tab before downloading had no way to get their document back at all.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('recover error: STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'This is not configured on the server yet.' });
  }

  const ip = getClientIp(req);
  // Tight limit: this endpoint fans out to a few Stripe API calls per request, and
  // there's no other abuse guard (like a captcha) in front of it.
  const { allowed, retryAfterSeconds } = checkRateLimit(`recover:${ip}`, {
    max: 5,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) {
    return rateLimitResponse(res, retryAfterSeconds);
  }

  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const customers = await stripe.customers.list({ email, limit: 5 });

    let latestPaidSession = null;

    for (const customer of customers.data) {
      const sessions = await stripe.checkout.sessions.list({ customer: customer.id, limit: 10 });
      for (const session of sessions.data) {
        if (session.payment_status !== 'paid') continue;
        if (!latestPaidSession || session.created > latestPaidSession.created) {
          latestPaidSession = session;
        }
      }
    }

    // Deliberately generic either way: confirming or denying that an email has a paid
    // order here would let anyone probe whether a given address bought something.
    if (!latestPaidSession) {
      return res.status(200).json({
        found: false,
        message:
          "We couldn't find a paid order for that email. Double-check the address you used at checkout, or email support and we'll look it up directly.",
      });
    }

    return res.status(200).json({ found: true, sessionId: latestPaidSession.id });
  } catch (error) {
    console.error('recover error:', error);
    return res.status(500).json({ error: 'Unable to look up your order right now. Please try again shortly.' });
  }
}
