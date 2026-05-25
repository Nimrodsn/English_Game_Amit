/**
 * Vercel serverless: generates a kid-friendly illustration via OpenAI.
 * Key is read from OPENAI_API_KEY (never expose with VITE_ prefix).
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const word = (req.query.word || '').trim();
  if (!word) {
    return res.status(400).json({ error: 'Missing word parameter' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const prompt = `A bright, colorful, kid-friendly cartoon illustration of "${word}" for children learning English. Simple, cheerful, safe, centered subject, soft pastel background, no text, no letters.`;

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-2',
        prompt,
        n: 1,
        size: '512x512',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI error:', err);
      return res.status(502).json({ error: 'Image generation failed' });
    }

    const data = await response.json();
    const url = data.data?.[0]?.url;

    if (!url) {
      return res.status(502).json({ error: 'No image returned' });
    }

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).json({ url });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
