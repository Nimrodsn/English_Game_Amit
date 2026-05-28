/**
 * Vercel serverless: OpenAI TTS for vocabulary pronunciation.
 * GET /api/speak-word?word=apple&lang=en
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const word = (req.query.word || '').trim();
  const lang = (req.query.lang || 'en').trim().toLowerCase();
  if (!word) {
    return res.status(400).json({ error: 'Missing word parameter' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1',
        input: word,
        voice: 'nova',
        instructions:
          lang === 'he'
            ? 'Speak clearly in Hebrew for children.'
            : 'Speak clearly in English for children.',
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI TTS error:', err);
      return res.status(502).json({ error: 'Speech generation failed' });
    }

    const buffer = Buffer.from(await response.arrayBuffer());
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
    return res.status(200).send(buffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
