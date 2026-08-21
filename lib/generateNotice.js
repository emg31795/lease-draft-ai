// Shared notice-generation logic, used by:
//   - api/generate.js  (free preview shown before checkout)
//   - api/deliver.js   (full document, only reachable after Stripe confirms payment)
//
// Keeping this in one place means the preview and the paid document are always
// produced the same way, and the required-field list only has to be maintained once.

import { getGroundedNoticeFacts } from './stateRules.js';

const REQUIRED_FIELDS = ['state', 'noticeType', 'landlordName', 'tenantName', 'propertyAddress'];

export function assertRequiredFields(fields) {
  const missing = REQUIRED_FIELDS.filter((key) => !fields?.[key]);

  // Cure or Quit notices are about a specific lease violation — without a description of
  // what the tenant actually did, the AI has nothing to work with and has historically
  // filled the gap with vague, generic language (the exact "why free templates get
  // thrown out" failure this product's own marketing warns about). Require it server-side
  // too, not just as a client-side form nicety, since /api/deliver calls this same
  // function directly against whatever metadata Stripe hands back.
  if (fields?.noticeType === 'Cure or Quit Notice' && !fields?.violationDescription) {
    missing.push('violationDescription');
  }

  // Florida's and Ohio's period-anchored notices (Fla. Stat. § 83.57, ORC § 5321.17(B))
  // can't be computed correctly without knowing where the tenant's rental period
  // actually falls — see lib/stateRules.js's periodicNoticeDeadline. Require it
  // server-side, not just client-side, for the same /api/deliver reason as above.
  const PERIOD_ANCHOR_COMBOS = new Set([
    'Florida|30-Day Notice to Vacate',
    'Florida|60-Day Notice to Vacate',
    'Ohio|30-Day Notice to Vacate',
  ]);
  if (PERIOD_ANCHOR_COMBOS.has(`${fields?.state}|${fields?.noticeType}`) && !fields?.periodStartDate) {
    missing.push('periodStartDate');
  }

  // New York's 30/60/90-day tier (RPL § 226-c) is driven by tenant occupancy length —
  // without it the wizard can't pick a legally sufficient notice period.
  const NY_TIER_TYPES = new Set([
    '30-Day Notice to Vacate',
    '60-Day Notice to Vacate',
    '90-Day Notice to Vacate',
  ]);
  if (
    fields?.state === 'New York' &&
    NY_TIER_TYPES.has(fields?.noticeType) &&
    (fields?.tenancyOccupancyMonths === undefined ||
      fields?.tenancyOccupancyMonths === null ||
      fields?.tenancyOccupancyMonths === '')
  ) {
    missing.push('tenancyOccupancyMonths');
  }

  if (missing.length > 0) {
    const err = new Error(`Missing required fields: ${missing.join(', ')}`);
    err.status = 400;
    throw err;
  }
}

export async function generateNotice(fields) {
  assertRequiredFields(fields);

  const {
    state,
    noticeType,
    landlordName,
    landlordPhone,
    tenantName,
    propertyAddress,
    amountOwed,
    dueDate,
    violationDescription,
    serveMethod,
    serverName,
    serveDate,
    periodStartDate,
    tenancyOccupancyMonths,
  } = fields;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Grounded facts (CA/TX pilot only — see lib/stateRules.js). When this returns null
  // (any other state, or a state/notice-type pair not yet researched), we fall back to
  // the prior behavior of letting the model reason about the citation and deadline
  // itself. That's a known gap for FL/NY/OH, not a regression — those states were never
  // grounded to begin with.
  const grounded = getGroundedNoticeFacts({ state, noticeType, serveDate, periodStartDate });

  const groundedFactsBlock = grounded
    ? `
STATUTORY FACTS (already researched and verified — use these exact facts. Do NOT invent
a different citation, notice period, or deadline date; do NOT do your own day-counting
math):
- Governing citation: ${grounded.citation}
- Notice period: ${grounded.noticePeriodLabel}
- Computed deadline date (the date by which the tenant must act): ${grounded.deadlineLabel}
${grounded.promptNotes.map((note) => `- Required note to incorporate: ${note}`).join('\n')}
`
    : '';

  const prompt = `You are a legal document generator specializing in US real estate law.
Draft a complete, official, and legally binding ${noticeType} for the state of ${state}.

DETAILS:
- Date of Notice: ${currentDate}
- Landlord / Property Manager: ${landlordName}${landlordPhone ? ` (Phone: ${landlordPhone})` : ''}
- Tenant Name(s): ${tenantName}
- Property Address: ${propertyAddress}
${amountOwed ? `- Amount Owed: $${amountOwed}` : ''}
${dueDate ? `- Original Rent Due Date: ${dueDate}` : ''}
${violationDescription ? `- Lease Violation to Cure: ${violationDescription}` : ''}
${periodStartDate ? `- Next Rental Period / Periodic Rent Due Date: ${periodStartDate}` : ''}
${tenancyOccupancyMonths ? `- Tenant Occupancy Length: ${tenancyOccupancyMonths} months` : ''}
${groundedFactsBlock}
PROOF OF SERVICE DETAILS (append a distinct, sworn Proof of Service / Affidavit of Service
section at the end of the document using these details):
- Method of Service: ${serveMethod || 'Personal Service'}
- Served By: ${serverName || landlordName}
- Date of Service: ${serveDate || currentDate}

CRITICAL RULES:
1. Do NOT use bracketed placeholders like [Insert Date] or [Tenant Name]. Use the exact provided details throughout the notice.
2. ${
    grounded
      ? 'Use ONLY the governing citation and computed deadline date given above in STATUTORY FACTS — do not add, replace, or independently calculate any other citation or date.'
      : `Include explicit state-specific statutory citations for ${state} (e.g., specific Civil Code or Revised Code sections).`
  }
${violationDescription ? `2b. This is a Cure or Quit notice. Describe the specific lease violation above (verbatim: "${violationDescription}") clearly in the body, and state exactly what the tenant must do to cure it by the deadline.` : ''}
3. Do NOT use Markdown formatting like asterisks (**bold**) or hashes (##). Use plain, capitalized formal headers.
4. Include a clean formal signature block at the bottom for ${landlordName}.
5. End with a separate section headed "PROOF OF SERVICE / AFFIDAVIT OF SERVICE", written as a
   sworn statement made under penalty of perjury, incorporating the service details above.
${grounded ? '6. Incorporate every "Required note to incorporate" from STATUTORY FACTS above into the document in a clearly readable way — these are not optional flavor text, they are legally significant (e.g. required disclosures or caution notes).' : ''}`;

  if (!process.env.ANTHROPIC_API_KEY) {
    const err = new Error('Server is not configured (missing ANTHROPIC_API_KEY).');
    err.status = 500;
    throw err;
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-5',
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const err = new Error(data.error?.message || 'Anthropic API error');
    err.status = 502;
    throw err;
  }

  // Don't assume content[0] is the text block — models with extended thinking
  // can emit a leading "thinking" block before the actual "text" block, and grabbing
  // index 0 silently returned an empty string in production. Collect every text
  // block instead (concatenating multiple, if the model ever splits them).
  const fullText = (data.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n')
    .trim();

  if (!fullText) {
    const err = new Error('Anthropic returned an empty document. Please try again.');
    err.status = 502;
    throw err;
  }

  return fullText;
}
