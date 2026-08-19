import Stripe from 'stripe';
import { generateNotice } from '../lib/generateNotice.js';

// Called by the /success page after a customer returns from Stripe Checkout.
// This is the only place the full (paid) document is produced and returned —
// it independently re-verifies payment with Stripe using the secret key before
// generating anything, so a session_id alone is never enough to get the document.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('deliver error: STRIPE_SECRET_KEY is not set');
    return res.status(500).json({ error: 'Payments are not configured on the server yet.' });
  }

  const sessionId = req.query.session_id;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ error: 'Missing session_id' });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(402).json({ error: 'Payment has not completed for this session yet.' });
    }

    const fullText = await generateNotice(session.metadata || {});
    const { noticeType, state } = session.metadata || {};
    return res.status(200).json({ fullText, noticeType, state });
  } catch (error) {
    console.error('deliver error:', error);
    const status = error.status || (error.type === 'StripeInvalidRequestError' ? 404 : 500);
    const message =
      error.type === 'StripeInvalidRequestError'
        ? 'We could not find that checkout session.'
        : error.message || 'Unable to retrieve your document.';
    return res.status(status).json({ error: message });
  }
}
