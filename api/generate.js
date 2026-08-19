import { generateNotice } from '../lib/generateNotice.js';

// Free preview endpoint, called from the wizard before checkout. Returns only a
// truncated preview so the full document is never sent to the browser pre-payment.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
