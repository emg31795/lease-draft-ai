// Shared notice-generation logic, used by:
//   - api/generate.js  (free preview shown before checkout)
//   - api/deliver.js   (full document, only reachable after Stripe confirms payment)
//
// Keeping this in one place means the preview and the paid document are always
// produced the same way, and the required-field list only has to be maintained once.

const REQUIRED_FIELDS = ['state', 'noticeType', 'landlordName', 'tenantName', 'propertyAddress'];

export function assertRequiredFields(fields) {
  const missing = REQUIRED_FIELDS.filter((key) => !fields?.[key]);
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
    serveMethod,
    serverName,
    serveDate,
  } = fields;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const prompt = `You are a legal document generator specializing in US real estate law.
Draft a complete, official, and legally binding ${noticeType} for the state of ${state}.

DETAILS:
- Date of Notice: ${currentDate}
- Landlord / Property Manager: ${landlordName}${landlordPhone ? ` (Phone: ${landlordPhone})` : ''}
- Tenant Name(s): ${tenantName}
- Property Address: ${propertyAddress}
${amountOwed ? `- Amount Owed: $${amountOwed}` : ''}
${dueDate ? `- Original Rent Due Date: ${dueDate}` : ''}

PROOF OF SERVICE DETAILS (append a distinct, sworn Proof of Service / Affidavit of Service
section at the end of the document using these details):
- Method of Service: ${serveMethod || 'Personal Service'}
- Served By: ${serverName || landlordName}
- Date of Service: ${serveDate || currentDate}

CRITICAL RULES:
1. Do NOT use bracketed placeholders like [Insert Date] or [Tenant Name]. Use the exact provided details throughout the notice.
2. Include explicit state-specific statutory citations for ${state} (e.g., specific Civil Code or Revised Code sections).
3. Do NOT use Markdown formatting like asterisks (**bold**) or hashes (##). Use plain, capitalized formal headers.
4. Include a clean formal signature block at the bottom for ${landlordName}.
5. End with a separate section headed "PROOF OF SERVICE / AFFIDAVIT OF SERVICE", written as a
   sworn statement made under penalty of perjury, incorporating the service details above.`;

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
