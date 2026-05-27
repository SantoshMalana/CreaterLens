import { VideoMetadata } from '@/types';

interface Props {
  video: VideoMetadata;
  index: number;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export default function VideoCard({ video, index }: Props) {
  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 flex flex-col gap-3">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold px-2 py-1 rounded bg-blue-600 text-white">
          Video {index + 1}
        </span>
        <span className="text-xs text-gray-400">{video.channelName}</span>
      </div>
      {video.thumbnail && (
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full rounded-lg object-cover aspect-video"
        />
      )}
      <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">
        {video.title}
      </h3>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-900 rounded-lg p-2 text-center">
          <div className="text-gray-400">Views</div>
          <div className="text-white font-bold">{formatNumber(video.views)}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-2 text-center">
          <div className="text-gray-400">Likes</div>
          <div className="text-white font-bold">{formatNumber(video.likes)}</div>
        </div>
        <div className="bg-gray-900 rounded-lg p-2 text-center">
          <div className="text-gray-400">Comments</div>
          <div className="text-white font-bold">{formatNumber(video.comments)}</div>
        </div>
        <div className="col-span-2 bg-gray-900 rounded-lg p-3 border border-gray-700">
          <div className="flex justify-between items-end mb-1">
            <span className="text-gray-400">Engagement</span>
            <span className="text-green-400 font-bold">{video.engagementRate}%</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${Math.min((video.engagementRate / 10) * 100, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      <div className="mt-1 text-xs text-gray-400 flex items-center gap-1">
        <span>📝</span>
        <span>{video.wordCount.toLocaleString()} words transcribed</span>
      </div>
    </div>
  );
}
