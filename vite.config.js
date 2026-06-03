import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { handleAdminUpdateScore } from './api/admin-update-score.js';

async function generateOpenAIImage(word, apiKey, category = '') {
  const topic = category && category !== 'mixed' ? ` about ${category}` : '';
  const prompt = `A bright, colorful, kid-friendly cartoon illustration of "${word}"${topic} for children learning English. Simple, cheerful, safe, centered subject, soft pastel background, no text, no letters.`;

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
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data.data?.[0]?.url ?? null;
}

async function speakWordOpenAI(word, apiKey, lang = 'en') {
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
    throw new Error(await response.text());
  }

  return Buffer.from(await response.arrayBuffer());
}

async function generateOpenAIPuzzles(category, count, apiKey) {
  const categoryHint =
    category === 'mixed'
      ? 'mixed everyday topics (animals, food, colors, body, furniture, clothes, school, nature, transport, family, weather, sports, places, feelings, numbers)'
      : `the "${category}" topic`;

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
            'You create English vocabulary quiz puzzles for 9-year-old children. Hebrew translations, exactly 4 options per puzzle. Return valid JSON only.',
        },
        {
          role: 'user',
          content: `Create exactly ${count} puzzles for ${categoryHint}. Each: word, translation (Hebrew), options (4 English words), category. Return { "puzzles": [...] }`,
        },
      ],
    }),
  });

  if (!response.ok) throw new Error(await response.text());
  const data = await response.json();
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
  return (parsed.puzzles || []).map((p, i) => ({
    $id: `ai-${category}-${Date.now()}-${i}`,
    word: String(p.word).toLowerCase().trim(),
    translation: String(p.translation || '').trim(),
    options: p.options.map((o) => String(o).toLowerCase().trim()),
    category: category === 'mixed' ? p.category || 'mixed' : category,
    image_url: '',
  }));
}

function openaiDevApiPlugin(env) {
  return {
    name: 'openai-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next();

        const url = new URL(req.url, 'http://localhost');
        const apiKey = env.OPENAI_API_KEY;

        if (req.url.startsWith('/api/generate-image')) {
          const word = url.searchParams.get('word')?.trim();
          const lang = (url.searchParams.get('lang') || 'en').trim().toLowerCase();
          const category = url.searchParams.get('category') || '';
          if (!word) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing word' }));
            return;
          }
          if (!apiKey) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'OpenAI API key not configured' }));
            return;
          }
          try {
            const imageUrl = await generateOpenAIImage(word, apiKey, category);
            res.statusCode = imageUrl ? 200 : 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(imageUrl ? { url: imageUrl } : { error: 'No image' }));
          } catch (err) {
            console.error('[openai-image]', err);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Image generation failed' }));
          }
          return;
        }

        if (req.url.startsWith('/api/speak-word')) {
          const word = url.searchParams.get('word')?.trim();
          if (!word) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Missing word' }));
            return;
          }
          if (!apiKey) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'OpenAI API key not configured' }));
            return;
          }
          try {
            const audio = await speakWordOpenAI(word, apiKey, lang);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'audio/mpeg');
            res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');
            res.end(audio);
          } catch (err) {
            console.error('[openai-speak]', err);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Speech generation failed' }));
          }
          return;
        }

        if (req.url.startsWith('/api/admin-update-score')) {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', (chunk) => {
            body += chunk;
          });
          req.on('end', async () => {
            try {
              const parsed = body ? JSON.parse(body) : {};
              const result = await handleAdminUpdateScore(parsed);
              res.statusCode = result.status;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(result.body));
            } catch (err) {
              console.error('[admin-update-score]', err);
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: 'Server error' }));
            }
          });
          return;
        }

        if (req.url.startsWith('/api/generate-puzzles')) {
          const category = url.searchParams.get('category') || 'animals';
          const count = Math.min(12, parseInt(url.searchParams.get('count') || '8', 10));
          if (!apiKey) {
            res.statusCode = 503;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'OpenAI API key not configured' }));
            return;
          }
          try {
            const puzzles = await generateOpenAIPuzzles(category, count, apiKey);
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ puzzles }));
          } catch (err) {
            console.error('[openai-puzzles]', err);
            res.statusCode = 502;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Puzzle generation failed' }));
          }
          return;
        }

        return next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), openaiDevApiPlugin(env)],
  };
});
