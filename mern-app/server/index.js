const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'training_data.json');

// Helper to Load/Save Local Data
const loadPosts = () => {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return [];
};

const savePosts = (posts) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(posts, null, 2));
};

// AI Config
const getAI = (apiKey) => new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: "gemini-2.5-flash" });

// API Endpoints

// 1. Get all trained posts
app.get('/api/posts', (req, res) => {
  res.json(loadPosts());
});

// 2. Add new training posts (Smart Extraction)
app.post('/api/train', async (req, res) => {
  const { content, apiKey } = req.body;
  if (!content || !apiKey) return res.status(400).json({ error: 'Missing content or API Key' });

  let posts = loadPosts();

  try {
    const model = getAI(apiKey);
    const extractionPrompt = `Extract clear LinkedIn post strings from this text as a JSON array of strings: [${content}]`;
    const result = await model.generateContent(extractionPrompt);
    const text = result.response.text();
    
    const cleaned = text.replace(/```json|```/g, '').trim();
    const newPosts = JSON.parse(cleaned);

    const updated = [...posts, ...newPosts.map(p => ({ id: Date.now() + Math.random(), content: p }))];
    savePosts(updated);
    res.json({ message: `Successfully trained!`, posts: updated });
  } catch (err) {
    const backup = [...posts, { id: Date.now(), content }];
    savePosts(backup);
    res.json({ message: 'Saved as raw training sample.', posts: backup });
  }
});

// 3. Generate Linkend Post
app.post('/api/generate', async (req, res) => {
  const { input, apiKey, tone, length } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'Missing API Key' });

  try {
    const posts = loadPosts().slice(-10); // Take last 10 samples
    const context = posts.map(p => p.content).join('\n---\n');

    const model = getAI(apiKey);
    const prompt = `
      BRAND STYLE SAMPLES:
      ${context || "Professional LinkedIn style."}

      TASK: Write a LinkedIn post.
      TOPIC/INPUT: ${input}
      TONE: ${tone}
      LENGTH: ${length}

      Rules: Use rhythmic hooks, emojis, and whitespace. Mimic brand samples if provided.
    `;

    const result = await model.generateContent(prompt);
    res.json({ text: result.response.text() });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete Post
app.delete('/api/posts/:id', (req, res) => {
  const posts = loadPosts().filter(p => String(p.id) !== String(req.params.id));
  savePosts(posts);
  res.json({ message: 'Deleted' });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT} (JSON Storage)`));
