'use client';
import { useState } from 'react';
import UrlInput from '@/components/UrlInput';
import VideoCard from '@/components/VideoCard';
import ChatWindow from '@/components/ChatWindow';
import { VideoMetadata } from '@/types';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState<string[]>([]);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAnalyze = async (urls: [string, string]) => {
    setLoading(true);
    setLoadingSteps([]);
    setError('');
    setVideos([]);
    setSessionId('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg = `HTTP error! status: ${res.status}`;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let doneReading = false;

      while (!doneReading) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE lines from buffer
        const parts = buffer.split('\n');
        buffer = parts.pop() || ''; // Keep incomplete line in buffer

        for (const line of parts) {
          if (line.startsWith('data: ')) {
            let data: any = null;
            try {
              data = JSON.parse(line.slice(6));
            } catch {
              // JSON parse error on incomplete chunk — skip silently
              continue;
            }

            if (data.error) {
              throw new Error(data.error);
            }
            if (data.step) {
              setLoadingSteps(prev => [...prev, data.step]);
            }
            if (data.done) {
              setVideos(data.videos);
              setSessionId(data.sessionId);
              doneReading = true;
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVideos([]);
    setSessionId('');
    setLoadingSteps([]);
    setError('');
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white font-sans">
      {/* Subtle gradient glow behind header */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-b from-blue-600/10 via-purple-600/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-lg shadow-blue-500/20">
              CL
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-white">
              CreatorLens
            </h1>
          </div>
          {videos.length === 2 && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
            >
              ✕ New Analysis
            </button>
          )}
        </header>

        {/* URL Input */}
        <UrlInput onAnalyze={handleAnalyze} loading={loading} />

        {/* Error */}
        {error && (
          <div className="max-w-3xl mx-auto mt-5 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-start gap-3">
            <span className="text-red-400 text-lg leading-none">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="max-w-3xl mx-auto mt-10">
            <div className="bg-white/[0.03] backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-base font-medium text-white/80 mb-5 flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Processing Pipeline
              </h3>
              <div className="flex flex-col gap-3">
                {loadingSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="text-sm text-white/60 font-mono flex items-center gap-2 pl-2 border-l-2 border-blue-500/40 animate-fadeIn"
                  >
                    {step}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        {videos.length === 2 && sessionId && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[78vh]">
            {/* Video cards */}
            <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-1">
              {videos.map((video, i) => (
                <VideoCard key={video.videoId} video={video} index={i} />
              ))}
            </div>

            {/* Chat window */}
            <div className="lg:col-span-2 bg-white/[0.02] rounded-2xl border border-white/10 flex flex-col overflow-hidden backdrop-blur-sm">
              <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-sm font-medium text-white/70 flex items-center gap-2">
                  <span className="text-base">🤖</span>
                  AI Analysis Chat
                </h2>
                <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  RAG Active
                </span>
              </div>
              <ChatWindow sessionId={sessionId} videos={videos} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
