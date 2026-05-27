import { ChatMessage as ChatMessageType } from '@/types';

interface Props {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] rounded-xl px-4 py-3 ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'bg-gray-800 text-gray-100 border border-gray-700'
      }`}>
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>

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
