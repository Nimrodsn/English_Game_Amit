import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

async function generateOpenAIImage(word, apiKey) {
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
    throw new Error(await response.text());
  }

  const data = await response.json();
  return data.data?.[0]?.url ?? null;
}

function openaiImageDevPlugin(env) {
  return {
    name: 'openai-image-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/generate-image')) {
          return next();
        }

        const url = new URL(req.url, 'http://localhost');
        const word = url.searchParams.get('word')?.trim();

        if (!word) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Missing word parameter' }));
          return;
        }

        const apiKey = env.OPENAI_API_KEY;
        if (!apiKey) {
          res.statusCode = 503;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'OpenAI API key not configured' }));
          return;
        }

        try {
          const imageUrl = await generateOpenAIImage(word, apiKey);
          res.statusCode = imageUrl ? 200 : 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(imageUrl ? { url: imageUrl } : { error: 'No image returned' }));
        } catch (err) {
          console.error('[openai-image]', err);
          res.statusCode = 502;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Image generation failed' }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), openaiImageDevPlugin(env)],
  };
});
