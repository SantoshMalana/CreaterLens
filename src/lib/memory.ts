import { ChatMessage } from '@/types';

const sessions = new Map<string, ChatMessage[]>();

export function getHistory(sessionId: string): ChatMessage[] {
  return sessions.get(sessionId) || [];
}

export function addMessage(sessionId: string, message: ChatMessage): void {
  const history = sessions.get(sessionId) || [];
  history.push(message);
  // Keep last 20 messages
  if (history.length > 20) history.shift();
  sessions.set(sessionId, history);
}
