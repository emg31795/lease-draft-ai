export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { state, noticeType, landlord, tenant, address } = req.body;

  if (!state || !noticeType || !landlord || !tenant || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const prompt = `You are a legal document generator specializing in US real estate law.
Draft a complete, official, and legally binding ${noticeType} for the state of ${state}.

DETAILS:
- Date of Notice: ${currentDate}
- Landlord / Property Manager: ${landlord}
- Tenant Name(s): ${tenant}
- Property Address: ${address}

CRITICAL RULES:
1. Do NOT use bracketed placeholders like [Insert Date] or [Tenant Name]. Use the exact provided details throughout the notice.
2. Include explicit state-specific statutory citations for ${state} (e.g., specific Civil Code or Revised Code sections).
3. Do NOT use Markdown formatting like asterisks (**bold**) or hashes (##). Use plain, capitalized formal headers.
4. Include a clean formal signature block at the bottom for ${landlord}.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenAI API error' });
    }

    const fullText = data.choices[0].message.content;
    const previewLines = fullText.split('\n').slice(0, 5).join('\n');
    const previewText = previewLines + "\n\n[... DOCUMENT LOCKED - COMPLETE $9 PAYMENT TO UNLOCK FULL PRINTABLE PDF ...]";

    return res.status(200).json({ 
      fullText: fullText, 
      previewText: previewText 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
