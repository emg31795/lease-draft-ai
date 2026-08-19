export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { state, noticeType, landlord, tenant, address } = req.body;

  if (!state || !noticeType || !landlord || !tenant || !address) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const prompt = `Draft a formal, legal ${noticeType} for the state of ${state}. 
Landlord: ${landlord}
Tenant: ${tenant}
Property Address: ${address}
Include proper statutory citations for ${state}. Keep it professional and legally formatted.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || 'OpenAI API error' });
    }

    const fullText = data.choices[0].message.content;
    
    // Return full text AND a truncated server-side preview
    const previewLines = fullText.split('\n').slice(0, 4).join('\n');
    const previewText = previewLines + "\n\n[... DOCUMENT LOCKED - COMPLETE $9 PAYMENT TO UNLOCK FULL PRINTABLE PDF ...]";

    return res.status(200).json({ 
      fullText: fullText, 
      previewText: previewText 
    });
  } catch (error) {
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
