export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { state, noticeType, landlord, tenant, address } = req.body;

  const prompt = `Draft an official, state-compliant ${noticeType} for the state of ${state}.
Landlord/Manager: ${landlord}
Tenant(s): ${tenant}
Rental Property Address: ${address}
Today's Date: ${new Date().toLocaleDateString()}

Ensure formal legal tone, applicable statutory references, clear notice period, and clean professional formatting.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    if (data.error) {
      return res.status(500).json({ error: data.error.message });
    }

    return res.status(200).json({ text: data.choices[0].message.content });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate document.' });
  }
}
