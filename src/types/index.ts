export interface VideoMetadata {
  videoId: string;
  url: string;
  title: string;
  channelName: string;
  views: number;
  likes: number;
  comments: number;
  duration: string;
  publishedAt: string;
  thumbnail: string;
  engagementRate: number;
  transcript: string;
  wordCount: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

export interface Citation {
  videoTitle: string;
  videoId: string;
  chunkIndex: number;
  text: string;
}

export interface AnalyzeResponse {
  videos: VideoMetadata[];
  sessionId: string;
}
