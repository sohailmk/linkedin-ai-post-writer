const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

// AI Config
const getAI = (apiKey) => new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-2.5-flash" });

// API Endpoints

// 1. Generate Linkend Post (Receives context from Frontend)
app.post('/api/generate', async (req, res) => {
  const { user_input, api_key, prompt_context, tone, length } = req.body;
  if (!api_key) return res.status(400).json({ error: 'Missing API Key' });

  try {
    const model = getAI(api_key);
    const prompt = `
      BRAND CONTEXT SAMPLES:
      ${prompt_context || "Default professional LinkedIn tone."}

      TASK: Write a viral LinkedIn post.
      TOPIC: ${user_input}
      TONE: ${tone || 'Professional'}
      LENGTH: ${length || 'Medium'}

      Rules: Use rhythmic hooks, emojis, and whitespace. Mimic brand samples if provided.
    `;

    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Smart Extract (Helps cleanup text for Frontend)
app.post('/api/extract', async (req, res) => {
  const { raw_text, api_key } = req.body;
  if (!api_key || !raw_text) return res.status(400).json({ error: 'Missing data' });
    
  try {
    const model = getAI(api_key);
    const extractionPrompt = `Extract individual LinkedIn post contents from the following messy text. Return them as a JSON list of strings only. No extra text.\n\nTEXT:\n${raw_text}`;
    const resp = await model.generateContent(extractionPrompt);
    
    const json_text = resp.response.text().replace(/```json|```/g, '').trim();
    const extracted = JSON.parse(json_text);
    res.json({ posts: extracted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api', (req, res) => res.send('AI API is live!'));

module.exports = app;
