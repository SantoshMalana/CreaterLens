'use client';
import { useState } from 'react';

interface Props {
  onAnalyze: (urls: [string, string]) => void;
  loading: boolean;
}

export default function UrlInput({ onAnalyze, loading }: Props) {
  const [url1, setUrl1] = useState('');
  const [url2, setUrl2] = useState('');

  const handleSubmit = () => {
    if (!url1.trim() || !url2.trim()) return;
    onAnalyze([url1.trim(), url2.trim()]);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-2 text-white">
        🎬 CreatorLens
      </h1>
      <p className="text-center text-gray-400 mb-8">
        Compare any two YouTube videos with AI-powered RAG analysis
      </p>
      <div className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="YouTube URL #1 — e.g. https://youtube.com/watch?v=..."
          value={url1}
          onChange={e => setUrl1(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="YouTube URL #2 — e.g. https://youtube.com/watch?v=..."
          value={url2}
          onChange={e => setUrl2(e.target.value)}
          className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleSubmit}
          disabled={loading || !url1 || !url2}
          className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all"
        >
          {loading ? '⏳ Analyzing videos...' : '🔍 Analyze & Compare'}
        </button>
      </div>
    </div>
  );
}
