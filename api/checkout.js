import Stripe from 'stripe';
import { assertRequiredFields } from '../lib/generateNotice.js';
import { checkRateLimit, getClientIp, rateLimitResponse } from '../lib/rateLimit.js';

// Fields we trust into Stripe Checkout Session metadata. Kept to short, plain-text
// values only — Stripe caps each metadata value at 500 characters.
const METADATA_FIELDS = [
  'state',
  'noticeType',
  'landlordName',
  'landlordPhone',
  'tenantName',
  'propertyAddress',
  'amountOwed',
  'dueDate',
  'violationDescription',
  'serveMethod',
  'serverName',
  'serveDate',
  'periodStartDate',
  'tenancyOccupancyMonths',
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('checkout error: STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Payments are not configured on the server yet.' });
  }

  const ip = getClientIp(req);
  const { allowed, retryAfterSeconds } = checkRateLimit(`checkout:${ip}`, {
    max: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (!allowed) {
    return rateLimitResponse(res, retryAfterSeconds);
  }

  const body = req.body || {};

  try {
    assertRequiredFields(body);
  } catch (error) {
    return res.status(error.status || 400).json({ error: error.message });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const metadata = {};
  for (const key of METADATA_FIELDS) {
    if (body[key] != null && body[key] !== '') {
      metadata[key] = String(body[key]).slice(0, 490);
    }
  }

  const origin =
    req.headers.origin ||
    (req.headers.host ? `https://${req.headers.host}` : 'https://www.leasedraftai.com');

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      // Always create a Customer record from the email Checkout already collects. There's
      // no database in this project, so this is what makes /api/recover possible: a
      // customer who loses their success-page tab can look their document back up by the
      // email they paid with, instead of the purchase being unrecoverable.
      customer_creation: 'always',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: 900,
            product_data: {
              name: `${body.noticeType} — ${body.state}`,
              description: 'Court-ready legal notice with Proof of Service affidavit',
            },
          },
          quantity: 1,
        },
      ],
      metadata,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout session error:', error);
    return res.status(500).json({ error: 'Unable to start checkout. Please try again.' });
  }
}
