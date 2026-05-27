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
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 group`}>
      <div className={`max-w-[80%] rounded-xl px-4 py-3 relative ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-100 border border-gray-700'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

        {/* Copy button — assistant messages only */}
        {!isUser && message.content && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-gray-700"
            title="Copy response"
          >
            {copied ? (
              <span className="text-green-400 text-xs font-medium">Copied!</span>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            )}
          </button>
        )}

        {/* Citations */}
        {message.citations && message.citations.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <p className="text-xs text-gray-400 mb-2">📎 Sources</p>
            <div className="flex flex-wrap gap-2">
              {message.citations.map((c, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-1 rounded-full bg-gray-700 text-gray-300 border border-gray-600"
                  title={c.text.slice(0, 100) + '...'}
                >
                  [{i + 1}] {c.videoTitle.slice(0, 30)}...
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

