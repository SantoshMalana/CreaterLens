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
    <div className="w-full max-w-3xl mx-auto">
      {/* Hero text */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold tracking-tight mb-3">
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Compare & Analyze
          </span>
        </h2>
        <p className="text-white/40 text-base max-w-md mx-auto">
          Paste two YouTube URLs below. Our AI will analyze transcripts, engagement metrics, and tell you what's working.
        </p>
      </div>

      {/* Input card */}
      <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">A</div>
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=..."
              value={url1}
              onChange={e => setUrl1(e.target.value)}
              className="w-full pl-14 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all text-sm"
            />
          </div>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">B</div>
            <input
              type="text"
              placeholder="https://youtube.com/watch?v=..."
              value={url2}
              onChange={e => setUrl2(e.target.value)}
              className="w-full pl-14 pr-4 py-3.5 rounded-xl bg-white/[0.04] border border-white/10 text-white placeholder-white/20 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all text-sm"
            />
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading || !url1 || !url2}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Analyzing...
            </span>
          ) : (
            'Analyze & Compare'
          )}
        </button>
      </div>
    </div>
  );
}
