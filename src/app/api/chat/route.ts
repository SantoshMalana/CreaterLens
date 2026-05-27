import { NextRequest } from 'next/server';
import Groq from 'groq-sdk';
import { retrieveRelevantChunks } from '@/lib/embeddings';
import { getHistory, addMessage } from '@/lib/memory';
import { creatorLensPrompt } from '@/lib/rag';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  const { message, sessionId, videoTitles } = await req.json();

  // Get relevant chunks
  const chunks = await retrieveRelevantChunks(sessionId, message, 5);

  // Build context
  const context = chunks
    .map((c, i) => `[Source ${i + 1} — "${c.videoTitle}"]:\n${c.text}`)
    .join('\n\n');

  // Get conversation history
  const history = getHistory(sessionId);

  const formattedPrompt = await creatorLensPrompt.format({
    context,
    history: history.map(m => `${m.role}: ${m.content}`).join('\n'),
    question: message,
  });

  // Save user message
  addMessage(sessionId, { role: 'user', content: message });

  // Stream response
  const stream = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'user', content: formattedPrompt },
    ],
    stream: true,
    max_tokens: 1024,
    temperature: 0.7,
  });

  // Return streaming response
  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullResponse = '';
      for await (const chunk of stream) {
        const text = chunk.choices[0]?.delta?.content || '';
        fullResponse += text;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      }
      // Save assistant response
      addMessage(sessionId, { role: 'assistant', content: fullResponse });
      // Send citations
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ citations: chunks, done: true })}\n\n`)
      );
      controller.close();
    },
  });

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
