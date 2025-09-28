import Link from 'next/link'
import { DevVideo } from '../pages/api/dev/videos'
import { short } from '../lib/storage'

interface CourseCardProps {
  video: DevVideo
}

export default function CourseCard({ video }: CourseCardProps) {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  return (
    <Link
      href={`/courses/${video.id}`}
      className="block bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden hover:border-yellow-500 transition-all duration-200 hover:transform hover:scale-105"
      aria-label={`Watch video: ${video.title}`}
    >
      <div className="relative">
        {video.thumbnail ? (
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-48 object-cover"
          />
        ) : (
          <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
            <div className="text-gray-400 text-lg">📹</div>
          </div>
        )}
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-l-[16px] border-l-white border-y-[10px] border-y-transparent ml-1"></div>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-white text-lg mb-2 line-clamp-2">
          {video.title}
        </h3>
        
        {video.description && (
          <p className="text-gray-400 text-sm mb-3 line-clamp-2">
            {truncateText(video.description, 100)}
          </p>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>By {short(video.author)}</span>
          <span>{formatDate(video.createdAt)}</span>
        </div>
      </div>
    </Link>
  )
}