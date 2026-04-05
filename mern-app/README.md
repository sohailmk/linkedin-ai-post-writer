# MERN AI LinkedIn Brand Builder 🚀

A high-performance full-stack web application built with **MongoDB, Express, React, and Node.js**.

## 🏗️ Architecture
- **Frontend**: React.js with Framer Motion and Tailwind CSS.
- **Backend**: Node.js & Express.
- **Database**: MongoDB (Atlas) for persistent training storage.
- **AI**: Gemini 2.5 Flash.

## 🚀 Getting Started

### 1. Database Setup
Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and get your connection string.
(Alternatively, it defaults to `mongodb://localhost:27017/linkedin-writer` for local dev).

### 2. Run the Backend
```bash
cd mern-app/server
# Update .env or use defaults
node index.js
```

### 3. Run the Frontend
```bash
cd mern-app/client
npm run dev
# OR use a static server like 'serve' or just 'npx vite'
npx vite
```

## ✨ New Features
- **Permanent Training**: Your style is now saved in a real database, not just locally.
- **AI Extraction**: Automatic cleanup of messy LinkedIn activity text.
- **Animated UI**: Smooth transitions and modern glassmorphism design.
- **Secure Key**: API key is managed via the UI and stored in `localStorage`.

## 📦 Tech Stack Details
- **Client**: `axios`, `lucide-react`, `framer-motion`, `Tailwind CDN`
- **Server**: `express`, `mongoose`, `cors`, `@google/generative-ai`
