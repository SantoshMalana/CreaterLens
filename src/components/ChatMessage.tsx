'use client';
import { useState } from 'react';
import { ChatMessage as ChatMessageType } from '@/types';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-6 group`}>
      <div className={`max-w-[85%] relative flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        
        {/* Avatar */}
        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
          isUser 
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
            : 'bg-white/5 border border-white/10 text-white/70'
        }`}>
          {isUser ? 'U' : '🤖'}
        </div>

        {/* Message Bubble */}
        <div className={`rounded-2xl px-5 py-4 relative group-hover:shadow-lg transition-shadow ${
          isUser
            ? 'bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-tr-sm shadow-blue-500/20'
            : 'bg-white/[0.03] text-white/90 border border-white/10 rounded-tl-sm shadow-black/20'
        }`}>
          <p className="text-[14px] leading-relaxed whitespace-pre-wrap">{message.content}</p>

          {/* Copy button */}
          {!isUser && message.content && (
            <button
              onClick={handleCopy}
              className="absolute -right-10 top-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white"
              title="Copy response"
            >
              {copied ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
              )}
            </button>
          )}

          {/* Citations */}
          {message.citations && message.citations.length > 0 && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-white/40 mb-2.5">
                Sources
              </p>
              <div className="flex flex-wrap gap-2">
                {message.citations.map((c, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-md bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white transition-colors cursor-default"
                    title={c.text.slice(0, 150) + '...'}
                  >
                    [{i + 1}] {c.videoTitle.slice(0, 35)}...
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
