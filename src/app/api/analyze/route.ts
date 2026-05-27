import { NextRequest, NextResponse } from 'next/server';
import { fetchFullVideoData } from '@/lib/youtube';
import { embedAndStore } from '@/lib/embeddings';

export async function POST(req: NextRequest) {
  try {
    const { urls } = await req.json();
    if (!urls || urls.length !== 2) {
      return NextResponse.json({ error: 'Exactly 2 URLs required' }, { status: 400 });
    }

    const sessionId = `session_${Date.now()}`;

    const videos = await Promise.all(
      urls.map((url: string) => fetchFullVideoData(url))
    );

    // Embed and store transcripts
    await Promise.all(
      videos.map(video =>
        embedAndStore(sessionId, video.videoId, video.title, video.transcript)
      )
    );

    return NextResponse.json({ videos, sessionId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
