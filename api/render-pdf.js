import { renderNoticePdf } from '../lib/renderNoticePdf.js';

// Pure formatter: turns already-delivered notice text into a downloadable PDF.
// Deliberately does NOT touch Stripe or re-generate the document — the caller
// (app/success/page.js) only reaches this after /api/deliver has already verified
// payment and handed back the exact text to render, so re-checking payment here
// would just risk the PDF drifting from what's shown on screen. This endpoint
// doesn't expose anything sensitive; it only formats text the client already has.
const MAX_TEXT_LENGTH = 50_000;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { fullText, title } = req.body || {};

  if (!fullText || typeof fullText !== 'string') {
    return res.status(400).json({ error: 'Missing fullText' });
  }
  if (fullText.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: 'Document is too long to render.' });
  }

  try {
    const pdfBytes = await renderNoticePdf({
      fullText,
      title: typeof title === 'string' ? title.slice(0, 200) : undefined,
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="LeaseDraft-Notice.pdf"');
    return res.status(200).send(Buffer.from(pdfBytes));
  } catch (error) {
    console.error('render-pdf error:', error);
    return res.status(error.status || 500).json({ error: error.message || 'Unable to generate PDF.' });
  }
}
