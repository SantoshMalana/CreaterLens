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
  const isWinner = video.engagementRate >= 8; // Example logic, could be better
  const barColor = isWinner ? 'bg-emerald-500' : 'bg-blue-500';

  return (
    <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/10 flex flex-col gap-4 relative overflow-hidden group hover:border-white/20 transition-colors">
      
      {/* Background glow */}
      <div className={`absolute -top-20 -right-20 w-40 h-40 ${isWinner ? 'bg-emerald-500/10' : 'bg-blue-500/10'} rounded-full blur-3xl`} />

      {/* Header */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${index === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
            Video {index === 0 ? 'A' : 'B'}
          </span>
          <span className="text-xs font-medium text-white/40 line-clamp-1">{video.channelName}</span>
        </div>
      </div>

      {/* Thumbnail */}
      {video.thumbnail && (
        <div className="relative rounded-xl overflow-hidden aspect-video border border-white/5">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-white/90 font-medium text-sm leading-snug line-clamp-2 relative z-10">
        {video.title}
      </h3>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-2 relative z-10">
        <div className="bg-black/20 rounded-lg p-2.5 flex flex-col items-center justify-center border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Views</span>
          <span className="text-white/80 font-medium text-sm">{formatNumber(video.views)}</span>
        </div>
        <div className="bg-black/20 rounded-lg p-2.5 flex flex-col items-center justify-center border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Likes</span>
          <span className="text-white/80 font-medium text-sm">{formatNumber(video.likes)}</span>
        </div>
        <div className="bg-black/20 rounded-lg p-2.5 flex flex-col items-center justify-center border border-white/5">
          <span className="text-[10px] uppercase tracking-wider text-white/40 mb-1">Comments</span>
          <span className="text-white/80 font-medium text-sm">{formatNumber(video.comments)}</span>
        </div>
        
        {/* Engagement Bar */}
        <div className="col-span-3 bg-black/20 rounded-xl p-3.5 border border-white/5 mt-1">
          <div className="flex justify-between items-end mb-2">
            <span className="text-xs font-medium text-white/50">Engagement Rate</span>
            <span className={`text-sm font-bold ${isWinner ? 'text-emerald-400' : 'text-blue-400'}`}>
              {video.engagementRate}%
            </span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor} shadow-[0_0_10px_rgba(var(--tw-colors-${isWinner ? 'emerald' : 'blue'}-500),0.5)]`}
              style={{ width: `${Math.min((video.engagementRate / 10) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 mt-auto border-t border-white/5 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {video.wordCount > 0 ? (
            <span className="text-white/30 text-xs">📝</span>
          ) : (
            <span className="text-red-400/80 text-xs">❌</span>
          )}
          <span className={`text-[11px] font-medium ${video.wordCount > 0 ? 'text-white/40' : 'text-red-400/80'}`}>
            {video.wordCount > 0 
              ? `${video.wordCount.toLocaleString()} words transcribed`
              : 'Transcript disabled'}
          </span>
        </div>
      </div>
    </div>
  );
}
