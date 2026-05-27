/**
 * Generate vocabulary puzzles with OpenAI (gpt-4o-mini).
 * GET /api/generate-puzzles?category=animals&count=8
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const category = (req.query.category || 'animals').trim();
  const count = Math.min(12, Math.max(4, parseInt(req.query.count, 10) || 8));
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(503).json({ error: 'OpenAI API key not configured' });
  }

  const categoryHint =
    category === 'mixed'
      ? 'mixed everyday topics (animals, food, colors, body, furniture, clothes, school, nature, transport)'
      : `the "${category}" topic`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.7,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You create English vocabulary quiz puzzles for 9-year-old children. ' +
              'Use simple words, Hebrew translations, exactly 4 options per puzzle (one correct). ' +
              'Return valid JSON only.',
          },
          {
            role: 'user',
            content: `Create exactly ${count} puzzles for ${categoryHint}.
Each puzzle object must have:
- word (English, lowercase, single common noun)
- translation (Hebrew)
- options (array of 4 different English words, includes the correct word)
- category (string: "${category === 'mixed' ? 'one of animals|food|colors|body|furniture|clothes|school|nature|transport' : category}")

Return: { "puzzles": [ ... ] }`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('OpenAI puzzles error:', err);
      return res.status(502).json({ error: 'Puzzle generation failed' });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);
    const puzzles = (parsed.puzzles || [])
      .filter((p) => p.word && Array.isArray(p.options) && p.options.length === 4)
      .map((p, i) => ({
        $id: `ai-${category}-${Date.now()}-${i}`,
        word: String(p.word).toLowerCase().trim(),
        translation: String(p.translation || '').trim(),
        options: p.options.map((o) => String(o).toLowerCase().trim()),
        category: category === 'mixed' ? p.category || 'mixed' : category,
        image_url: '',
      }));

    if (puzzles.length === 0) {
      return res.status(502).json({ error: 'No valid puzzles generated' });
    }

    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json({ puzzles });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}
