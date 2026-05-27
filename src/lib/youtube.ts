import { YoutubeTranscript } from 'youtube-transcript';
import axios from 'axios';
import { VideoMetadata } from '@/types';

export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchVideoMetadata(videoId: string): Promise<Omit<VideoMetadata, 'transcript' | 'engagementRate'>> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const response = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos`,
    {
      params: {
        id: videoId,
        part: 'snippet,statistics,contentDetails',
        key: apiKey,
      },
    }
  );

  const item = response.data.items[0];
  if (!item) throw new Error(`Video not found: ${videoId}`);

  const stats = item.statistics;
  const snippet = item.snippet;

  return {
    videoId,
    url: `https://youtube.com/watch?v=${videoId}`,
    title: snippet.title,
    channelName: snippet.channelTitle,
    views: parseInt(stats.viewCount || '0'),
    likes: parseInt(stats.likeCount || '0'),
    comments: parseInt(stats.commentCount || '0'),
    duration: item.contentDetails.duration,
    publishedAt: snippet.publishedAt,
    thumbnail: snippet.thumbnails?.high?.url || '',
  };
}

export async function fetchTranscript(videoId: string): Promise<string> {
  try {
    const transcriptItems = await YoutubeTranscript.fetchTranscript(videoId);
    return transcriptItems.map(item => item.text).join(' ');
  } catch {
    return 'Transcript not available for this video.';
  }
}

export function computeEngagementRate(likes: number, comments: number, views: number): number {
  if (views === 0) return 0;
  return parseFloat(((likes + comments) / views * 100).toFixed(2));
}

export async function fetchFullVideoData(url: string): Promise<VideoMetadata> {
  const videoId = extractVideoId(url);
  if (!videoId) throw new Error('Invalid YouTube URL');

  const [metadata, transcript] = await Promise.all([
    fetchVideoMetadata(videoId),
    fetchTranscript(videoId),
  ]);

  const engagementRate = computeEngagementRate(
    metadata.likes,
    metadata.comments,
    metadata.views
  );

  const wordCount = transcript.split(/\s+/).filter(Boolean).length;

  return { ...metadata, transcript, engagementRate, wordCount };
}
