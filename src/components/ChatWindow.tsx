'use client';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, Citation, VideoMetadata } from '@/types';
import ChatMessage from './ChatMessage';

interface Props {
  sessionId: string;
  videos: VideoMetadata[];
}

export default function ChatWindow({ sessionId, videos }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch dynamic suggested questions when videos are loaded
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await fetch('/api/suggest', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoTitles: videos.map(v => v.title) }),
        });
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setSuggestedQuestions(data.questions);
        }
      } catch {
        setSuggestedQuestions([
          'Which video has a stronger hook?',
          'Why did one video outperform the other?',
          'What improvements can I make to my content?',
          'Compare the opening 30 seconds of both videos',
        ]);
      }
    };
    if (videos.length === 2) fetchSuggestions();
  }, [videos]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMessage: ChatMessageType = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setStreaming(true);

    const assistantMessage: ChatMessageType = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          sessionId,
          videoTitles: videos.map(v => v.title),
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = `HTTP error! status: ${response.status}`;
        try {
          const errJson = JSON.parse(errText);
          errMsg = errJson.error || errMsg;
        } catch {}
        throw new Error(errMsg);
      }

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let citations: Citation[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder.decode(value).split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    content: updated[updated.length - 1].content + data.text,
                  };
                  return updated;
                });
              }
              if (data.citations) citations = data.citations;
              if (data.done) {
                setMessages(prev => {
                  const updated = [...prev];
                  updated[updated.length - 1] = {
                    ...updated[updated.length - 1],
                    citations,
                  };
                  return updated;
                });
              }
            } catch {}
          }
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: 'assistant',
          content: `⚠️ Error: ${error.message || 'Unable to connect to chat assistant.'}`,
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-black/20">
      {/* Suggested questions (Empty state) */}
      {messages.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-white/5 shadow-lg shadow-blue-500/5">
            <span className="text-2xl">✨</span>
          </div>
          <h3 className="text-xl font-medium text-white/90 mb-2">How can I help you compare?</h3>
          <p className="text-sm text-white/40 mb-8 text-center max-w-sm">
            Our AI has processed both transcripts and embeddings. Ask anything about hooks, pacing, or engagement.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
            {suggestedQuestions.length > 0 ? (
              suggestedQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-sm text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white/70 hover:bg-white/[0.06] hover:border-blue-500/50 hover:text-white transition-all group"
                >
                  <span className="text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity mr-2">→</span>
                  {q}
                </button>
              ))
            ) : (
              <div className="col-span-2 flex justify-center py-4">
                <span className="text-sm text-white/30 animate-pulse flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
                  Generating smart questions...
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex-1 overflow-y-auto p-5 scroll-smooth">
          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}
          {streaming && (
            <div className="flex justify-start mb-6">
              <div className="bg-white/[0.03] border border-white/10 rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white/[0.02] border-t border-white/10 backdrop-blur-md">
        <div className="max-w-4xl mx-auto relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask about hooks, engagement, improvements..."
            disabled={streaming}
            className="w-full pl-5 pr-14 py-3.5 rounded-xl bg-white/[0.05] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all text-sm shadow-inner"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="absolute right-2 p-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-0 text-white transition-all transform hover:scale-105 active:scale-95"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] text-white/30 mt-3 font-medium">
          CreatorLens AI can make mistakes. Verify important transcript claims.
        </p>
      </div>
    </div>
  );
}
