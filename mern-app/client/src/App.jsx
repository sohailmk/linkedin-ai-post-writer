import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Trash2, Zap, Brain, Sparkles, Settings, Copy, PlusCircle } from 'lucide-react';

const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : '/api';

const App = () => {
  const [apiKey, setApiKey] = useState(localStorage.getItem('gemini_key') || '');
  const [posts, setPosts] = useState(JSON.parse(localStorage.getItem('trained_posts')) || []);
  const [trainingInput, setTrainingInput] = useState('');
  const [generationInput, setGenerationInput] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('train');

  useEffect(() => {
    localStorage.setItem('trained_posts', JSON.stringify(posts));
  }, [posts]);

  const saveApiKey = (e) => {
    setApiKey(e.target.value);
    localStorage.setItem('gemini_key', e.target.value);
  };

  const handleTrain = async () => {
    if (!trainingInput || !apiKey) return alert('Enter API key and training data!');
    setLoading(true);
    try {
      // Use AI to clean up the content if it's long/messy
      const { data } = await axios.post(`${API_BASE}/extract`, { raw_text: trainingInput, api_key: apiKey });
      const newPosts = data.posts.map(p => ({ id: Date.now() + Math.random(), content: p }));
      setPosts([...posts, ...newPosts]);
      setTrainingInput('');
    } catch (err) {
      // Simple fallback if AI extraction fails
      setPosts([...posts, { id: Date.now(), content: trainingInput }]);
      setTrainingInput('');
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    if (!generationInput || !apiKey) return alert('No topic or API key!');
    setLoading(true);
    try {
      // Pass the trained posts context to the API
      const context = posts.map(p => p.content).join('\n---\n');
      const { data } = await axios.post(`${API_BASE}/generate`, { 
        user_input: generationInput, 
        api_key: apiKey,
        prompt_context: context,
        tone: 'Professional',
        length: 'Medium'
      });
      setGeneratedPost(data.text);
    } catch (err) {
      alert('Generation failed: ' + err.message);
    }
    setLoading(false);
  };

  const deletePost = (id) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#e2e8f0] font-sans selection:bg-blue-500/30">
      <nav className="border-b border-gray-800 p-4 bg-[#161b22]/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              AI LinkedIn Writer
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <div className="relative group">
              <Settings className="w-5 h-5 text-gray-400 cursor-pointer group-hover:text-white transition-colors" />
              <div className="absolute right-0 top-10 mt-2 p-4 bg-[#161b22] border border-gray-800 rounded-xl w-72 shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                <p className="text-sm text-gray-400 mb-2">Gemini API Key</p>
                <input type="password" value={apiKey} onChange={saveApiKey} className="w-full bg-[#0d1117] border border-gray-800 p-2 rounded-lg text-sm text-[#3b82f6] outline-none" placeholder="Paste Key Here..." />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6 md:p-12">
        <div className="flex justify-center gap-8 mb-12">
          {['train', 'generate'].map(t => (
            <button key={t} onClick={() => setTab(t)} className={`pb-2 px-4 transition-all ${tab === t ? 'border-b-2 border-blue-500 text-white font-bold' : 'text-gray-500'}`}>{t.toUpperCase()}</button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AnimatePresence mode="wait">
            {tab === 'train' ? (
              <motion.div key="train" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="bg-[#161b22] border border-gray-800 p-8 rounded-3xl shadow-xl">
                   <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Brain className="text-purple-400" /> Train Brand Voice</h2>
                  <textarea className="w-full bg-[#0d1117] border border-gray-800 p-4 rounded-xl h-48 outline-none focus:border-blue-500/50 transition-all shadow-inner" placeholder="Paste your past posts or profile text here..." value={trainingInput} onChange={(e) => setTrainingInput(e.target.value)} />
                  <button onClick={handleTrain} disabled={loading} className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-700 hover:opacity-90 disabled:opacity-50 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all">{loading ? 'AI Extracting...' : <><PlusCircle size={20} /> Add to Training Data</>}</button>
                </div>
                <div className="space-y-3">
                   <h3 className="text-gray-400 text-sm uppercase tracking-wider">Trained Samples ({posts.length})</h3>
                   {posts.map(p => (
                    <motion.div key={p.id} className="bg-[#161b22] p-4 rounded-xl border border-gray-800/50 flex justify-between group">
                      <p className="text-sm line-clamp-2 text-gray-300">{p.content}</p>
                      <Trash2 onClick={() => deletePost(p.id)} className="w-5 h-5 text-gray-600 hover:text-red-500 cursor-pointer transition-colors opacity-0 group-hover:opacity-100" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="generate" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#161b22] border border-gray-800 p-8 rounded-3xl shadow-xl h-fit">
                   <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Zap className="text-yellow-400" /> New Design</h2>
                  <input className="w-full bg-[#0d1117] border border-gray-800 p-4 rounded-xl mb-4 outline-none focus:border-blue-500/50" placeholder="What's the post about?" value={generationInput} onChange={(e) => setGenerationInput(e.target.value)} />
                  <button onClick={handleGenerate} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2">{loading ? 'AI Designing...' : 'Magic Generate ✨'}</button>
                </div>
                <div className="bg-[#161b22]/50 border border-gray-800 p-8 rounded-3xl min-h-[400px]">
                   <div className="flex justify-between items-center mb-6">
                    <h3 className="text-gray-400 text-sm uppercase tracking-wider">Design Output</h3>
                    {generatedPost && <Copy className="w-5 h-5 cursor-pointer hover:text-white" onClick={() => navigator.clipboard.writeText(generatedPost)} />}
                  </div>
                  <div className="text-gray-200 leading-relaxed whitespace-pre-wrap">{generatedPost || "Your post will appear here..."}</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
      <footer className="text-center p-12 text-gray-600 text-sm italic">AI LinkedIn Brand Builder | Private & Database-Less Deployment</footer>
    </div>
  );
};

export default App;
