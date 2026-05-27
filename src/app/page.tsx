'use client';
import { useState } from 'react';
import UrlInput from '@/components/UrlInput';
import VideoCard from '@/components/VideoCard';
import ChatWindow from '@/components/ChatWindow';
import { VideoMetadata, AnalyzeResponse } from '@/types';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<VideoMetadata[]>([]);
  const [sessionId, setSessionId] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleAnalyze = async (urls: [string, string]) => {
    setLoading(true);
    setError('');
    setVideos([]);
    setSessionId('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });

      const data: AnalyzeResponse = await res.json();
      if (!res.ok) throw new Error((data as any).error);

      setVideos(data.videos);
      setSessionId(data.sessionId);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* URL Input */}
        <UrlInput onAnalyze={handleAnalyze} loading={loading} />

        {/* Error */}
        {error && (
          <div className="max-w-4xl mx-auto mt-4 p-4 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            ⚠️ {error}
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="max-w-4xl mx-auto mt-8 text-center">
            <div className="inline-flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-400 text-sm">Fetching transcripts, computing embeddings, building vector store...</p>
            </div>
          </div>
        )}

        {/* Main content */}
        {videos.length === 2 && sessionId && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 h-[75vh]">
            {/* Video cards */}
            <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto">
              {videos.map((video, i) => (
                <VideoCard key={video.videoId} video={video} index={i} />
              ))}
            </div>

            {/* Chat window */}
            <div className="lg:col-span-2 bg-gray-900 rounded-xl border border-gray-700 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700">
                <h2 className="text-sm font-semibold text-gray-300">
                  🤖 AI Analysis Chat
                  <span className="ml-2 text-xs text-green-400">● RAG Active</span>
                </h2>
              </div>
              <ChatWindow sessionId={sessionId} videos={videos} />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
