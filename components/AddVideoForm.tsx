import { useState } from 'react'

interface VideoFormData {
  title: string
  description: string
  youtubeUrl: string
}

interface AddVideoFormProps {
  courseId: string
  courseTitle: string
  onAddVideos: (videos: VideoFormData[]) => Promise<void>
  onCancel: () => void
}

export default function AddVideoForm({ courseId, courseTitle, onAddVideos, onCancel }: AddVideoFormProps) {
  const [videos, setVideos] = useState<VideoFormData[]>([
    { title: '', description: '', youtubeUrl: '' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate videos
    const validVideos = videos.filter(v => v.title.trim() && v.youtubeUrl.trim())
    if (validVideos.length === 0) {
      setError('At least one video with title and URL is required')
      return
    }

    // Validate YouTube URLs
    const ytPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    for (let i = 0; i < validVideos.length; i++) {
      if (!ytPattern.test(validVideos[i].youtubeUrl)) {
        setError(`Video ${i + 1}: Please enter a valid YouTube URL`)
        return
      }
    }

    try {
      setIsLoading(true)
      await onAddVideos(validVideos)
      
      // Reset form
      setVideos([{ title: '', description: '', youtubeUrl: '' }])
    } catch (err: any) {
      console.error('Add videos error:', err)
      setError(err.message || 'Failed to add videos')
    } finally {
      setIsLoading(false)
    }
  }

  const addVideoField = () => {
    setVideos([...videos, { title: '', description: '', youtubeUrl: '' }])
  }

  const removeVideoField = (index: number) => {
    if (videos.length > 1) {
      setVideos(videos.filter((_, i) => i !== index))
    }
  }

  const updateVideo = (index: number, field: keyof VideoFormData, value: string) => {
    const updated = [...videos]
    updated[index][field] = value
    setVideos(updated)
  }

  return (
    <div className="card max-w-4xl mx-auto">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-ctd-text mb-2">
          Add Videos to Module
        </h3>
        <p className="text-ctd-mute">
          Adding videos to: <span className="text-ctd-yellow font-semibold">{courseTitle}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {videos.map((video, index) => (
            <div key={index} className="card bg-ctd-panel">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-ctd-text">
                  Video {index + 1}
                </h4>
                {videos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVideoField(index)}
                    className="text-red-400 hover:text-red-300 font-medium"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Video title..."
                  value={video.title}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 bg-ctd-bg border border-ctd-border rounded text-ctd-text placeholder-ctd-mute focus:outline-none focus:ring-2 focus:ring-ctd-yellow"
                  disabled={isLoading}
                />
                
                <textarea
                  rows={2}
                  placeholder="Video description (optional)..."
                  value={video.description}
                  onChange={(e) => updateVideo(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 bg-ctd-bg border border-ctd-border rounded text-ctd-text placeholder-ctd-mute focus:outline-none focus:ring-2 focus:ring-ctd-yellow resize-none"
                  disabled={isLoading}
                />
                
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={video.youtubeUrl}
                  onChange={(e) => updateVideo(index, 'youtubeUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-ctd-bg border border-ctd-border rounded text-ctd-text placeholder-ctd-mute focus:outline-none focus:ring-2 focus:ring-ctd-yellow"
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={addVideoField}
            disabled={isLoading}
            className="btn-ghost"
          >
            + Add Another Video
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="btn-ghost flex-1"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? 'Adding Videos...' : `Add ${videos.filter(v => v.title.trim() && v.youtubeUrl.trim()).length} Video(s)`}
          </button>
        </div>
      </form>
    </div>
  )
}