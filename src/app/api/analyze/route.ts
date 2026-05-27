import { NextRequest, NextResponse } from 'next/server';
import { fetchFullVideoData } from '@/lib/youtube';
import { embedAndStore } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();
    if (!urls || urls.length !== 2) {
      return NextResponse.json({ error: 'Exactly 2 URLs required' }, { status: 400 });
    }

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        const sendStep = (msg: string) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ step: msg })}\n\n`));
        };
        try {
          const sessionId = `session_${Date.now()}`;
          
          sendStep('✅ Fetching video metadata...');
          sendStep('✅ Extracting transcripts...');
          const videos = await Promise.all(
            urls.map((url: string) => fetchFullVideoData(url))
          );

          sendStep('⏳ Computing embeddings...');
          sendStep('⏳ Building vector store...');
          await Promise.all(
            videos.map(video =>
              embedAndStore(sessionId, video.videoId, video.title, video.transcript)
            )
          );

          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true, videos, sessionId })}\n\n`));
          controller.close();
        } catch (err: any) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: err.message })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
