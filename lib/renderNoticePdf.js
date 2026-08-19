import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

// Formats a generated notice (plain text, produced by generateNotice()) into a
// properly paginated, letter-size PDF — replacing the old approach of relying on
// the browser's window.print() against an on-screen text blob.
//
// The Proof of Service / Affidavit of Service section (appended by the prompt in
// lib/generateNotice.js) is pushed onto its own fresh page so it reads as a
// distinct, signable document rather than trailing off the bottom of the notice.

const PAGE_WIDTH = 612; // 8.5in
const PAGE_HEIGHT = 792; // 11in
const MARGIN = 72; // 1in
const FONT_SIZE = 11;
const LINE_HEIGHT = 15;
const HEADER_COLOR = rgb(0.15, 0.25, 0.55);
const FOOTER_COLOR = rgb(0.55, 0.55, 0.55);

const PROOF_OF_SERVICE_PATTERN = /^\s*(PROOF OF SERVICE|AFFIDAVIT OF SERVICE)/i;

function wrapLine(text, font, size, maxWidth) {
  if (text.trim() === '') return [''];

  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (current && font.widthOfTextAtSize(candidate, size) > maxWidth) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);

  return lines;
}

export async function renderNoticePdf({ fullText, title }) {
  if (!fullText || typeof fullText !== 'string') {
    const err = new Error('fullText is required');
    err.status = 400;
    throw err;
  }

  const pdfDoc = await PDFDocument.create();
  pdfDoc.setTitle(title || 'Legal Notice');
  pdfDoc.setProducer('LeaseDraft AI');

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const maxWidth = PAGE_WIDTH - MARGIN * 2;

  const pages = [];
  let page;
  let y;

  const drawHeader = () => {
    page.drawText('LeaseDraft AI', {
      x: MARGIN,
      y: PAGE_HEIGHT - MARGIN + 34,
      size: 9,
      font: boldFont,
      color: HEADER_COLOR,
    });
    if (title) {
      page.drawText(title, {
        x: PAGE_WIDTH - MARGIN - font.widthOfTextAtSize(title, 9),
        y: PAGE_HEIGHT - MARGIN + 34,
        size: 9,
        font,
        color: FOOTER_COLOR,
      });
    }
    page.drawLine({
      start: { x: MARGIN, y: PAGE_HEIGHT - MARGIN + 24 },
      end: { x: PAGE_WIDTH - MARGIN, y: PAGE_HEIGHT - MARGIN + 24 },
      thickness: 0.5,
      color: rgb(0.85, 0.85, 0.85),
    });
  };

  const startNewPage = () => {
    page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pages.push(page);
    y = PAGE_HEIGHT - MARGIN;
    drawHeader();
  };

  startNewPage();

  const rawLines = fullText.replace(/\r\n/g, '\n').split('\n');

  for (const rawLine of rawLines) {
    const isProofHeading = PROOF_OF_SERVICE_PATTERN.test(rawLine);

    // Give the Proof of Service section a fresh page, unless we're already at the top of one.
    if (isProofHeading && y < PAGE_HEIGHT - MARGIN) {
      startNewPage();
    }

    const wrapped = wrapLine(rawLine, font, FONT_SIZE, maxWidth);
    for (const line of wrapped) {
      if (y < MARGIN + LINE_HEIGHT) {
        startNewPage();
      }
      page.drawText(line, {
        x: MARGIN,
        y,
        size: FONT_SIZE,
        font: isProofHeading ? boldFont : font,
      });
      y -= LINE_HEIGHT;
    }
  }

  pages.forEach((p, idx) => {
    const label = `Page ${idx + 1} of ${pages.length}`;
    p.drawText(label, {
      x: PAGE_WIDTH / 2 - font.widthOfTextAtSize(label, 8) / 2,
      y: MARGIN / 2,
      size: 8,
      font,
      color: FOOTER_COLOR,
    });
  });

  return pdfDoc.save();
}
