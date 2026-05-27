'use client';
import { useState, useRef, useEffect } from 'react';
import { ChatMessage as ChatMessageType, Citation, VideoMetadata } from '@/types';
import ChatMessage from './ChatMessage';

interface Props {
  sessionId: string;
  videos: VideoMetadata[];
}

const SUGGESTED_QUESTIONS = [
  'Which video has a stronger hook?',
  'Why did one video outperform the other?',
  'What improvements can I make to my content?',
  'Compare the opening 30 seconds of both videos',
];

export default function ChatWindow({ sessionId, videos }: Props) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Suggested questions */}
      {messages.length === 0 && (
        <div className="p-4 grid grid-cols-2 gap-2">
          {SUGGESTED_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q)}
              className="text-xs text-left px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 hover:border-blue-500 hover:text-white transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}
        {streaming && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800 rounded-xl px-4 py-3 border border-gray-700">
              <span className="animate-pulse text-gray-400 text-sm">●●●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Ask about hooks, engagement, improvements..."
            disabled={streaming}
            className="flex-1 px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={streaming || !input.trim()}
            className="px-5 py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-all"
          >
            {streaming ? '⏳' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}
