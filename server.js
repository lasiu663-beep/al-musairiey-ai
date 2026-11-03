import 'dotenv/config';
import express from 'express';
import OpenAI from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(express.static(path.join(__dirname, 'public')));

const whatsappUrl = 'https://wa.me/966502618568';
let products = [];
try {
  products = JSON.parse(await fs.readFile(path.join(__dirname, 'data/products.json'), 'utf8'));
} catch {
  products = [];
}

function findProducts(query) {
  const terms = query.toLowerCase().split(/\s+/).filter(x => x.length > 2);
  if (!terms.length) return [];
  return products.map(p => {
    const haystack = [p.name, p.code, p.category, p.description].join(' ').toLowerCase();
    const score = terms.reduce((n, term) => n + (haystack.includes(term) ? 1 : 0), 0);
    return { ...p, score };
  }).filter(p => p.score > 0).sort((a,b) => b.score - a.score).slice(0, 8);
}

app.post('/api/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) return res.status(400).json({ error: 'Please enter a question.' });
    if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'AI service is not configured yet. Please contact the site administrator.' });

    const matches = findProducts(message);
    const catalogContext = matches.length
      ? matches.map((p,i) => `${i+1}. ${p.name}\nProduct code: ${p.code || 'Not listed'}\nCategory: ${p.category || 'Not listed'}\nDetails: ${p.description || 'No published details'}\nProduct page: ${p.url || ''}`).join('\n\n')
      : 'No matching product was found in the currently imported public catalog.';

    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      messages: [
        { role: 'system', content: `You are Al Musairiey AI, a multilingual industrial-products assistant. Detect the customer's language and answer in that same language. Use ONLY the supplied catalog context for claims about company products. Never invent product codes, specifications, prices, stock levels, warranties, or delivery promises. If details are missing or no reliable match exists, say so clearly and offer WhatsApp contact: ${whatsappUrl}. If several products may match, ask a concise clarifying question. Be helpful and concise. Do not claim to be a human.` },
        { role: 'user', content: `Customer question:\n${message}\n\nRelevant public catalog records:\n${catalogContext}` }
      ]
    });
    res.json({
      answer: completion.choices[0]?.message?.content || 'I could not prepare an answer.',
      matches: matches.map(({name,code,url}) => ({name,code,url})),
      whatsapp: whatsappUrl
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong. Please try again or contact us on WhatsApp.' });
  }
});

app.get('/api/status', (_req,res) => res.json({ ready: Boolean(process.env.OPENAI_API_KEY), products: products.length }));
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Al Musairiey AI running on http://localhost:${port}`));
