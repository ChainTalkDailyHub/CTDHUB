import { useState } from 'react'

interface VideoFormData {
  title: string
  description: string
  youtubeUrl: string
}

interface CourseFormProps {
  onSubmit: (data: { 
    title: string
    description: string
    videos: VideoFormData[]
  }) => Promise<void>
  onAddToExisting?: (courseId: string, videos: VideoFormData[]) => Promise<void>
  existingCourses?: Array<{id: string, title: string, totalVideos: number}>
  isUpdate?: boolean
}

export default function CourseForm({ onSubmit, onAddToExisting, existingCourses = [], isUpdate = false }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [videos, setVideos] = useState<VideoFormData[]>([
    { title: '', description: '', youtubeUrl: '' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'new' | 'existing'>('new')
  const [selectedCourseId, setSelectedCourseId] = useState('')

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

      if (mode === 'existing' && selectedCourseId && onAddToExisting) {
        await onAddToExisting(selectedCourseId, validVideos)
      } else {
        if (!formData.title.trim() || !formData.description.trim()) {
          setError('Course title and description are required')
          return
        }
        await onSubmit({ ...formData, videos: validVideos })
      }

      // Reset form
      setFormData({ title: '', description: '' })
      setVideos([{ title: '', description: '', youtubeUrl: '' }])
      setSelectedCourseId('')
      setMode('new')
    } catch (err: any) {
      setError('Upload failed. Check the fields and try again.')
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

  const myCourses = existingCourses.filter(course => course.totalVideos > 0)

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-white mb-2">Create Course Content</h3>
        <p className="text-gray-400 text-sm">
          📚 <strong>Smart Organization:</strong> If your videos belong to the same course/module, 
          select "Add to Existing Course" instead of creating a new one. This keeps content organized!
        </p>
      </div>

      {myCourses.length > 0 && (
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'new' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🆕 New Course
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                mode === 'existing' 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ➕ Add to Existing
            </button>
          </div>

          {mode === 'existing' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Your Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">Choose a course...</option>
                {myCourses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title} ({course.totalVideos} videos)
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {mode === 'new' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                placeholder="e.g., Complete Blockchain Development"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Course Description *
              </label>
              <textarea
                rows={3}
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                placeholder="Brief description of what students will learn..."
                disabled={isLoading}
              />
            </div>
          </>
        )}

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Course Videos *
            </label>
            <button
              type="button"
              onClick={addVideoField}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
            >
              + Add Video
            </button>
          </div>

          {videos.map((video, index) => (
            <div key={index} className="bg-gray-700 p-4 rounded-lg mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-300">
                  Video {index + 1}
                </h4>
                {videos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVideoField(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
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
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={isLoading}
                />
                
                <textarea
                  rows={2}
                  placeholder="Video description (optional)..."
                  value={video.description}
                  onChange={(e) => updateVideo(index, 'description', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                  disabled={isLoading}
                />
                
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={video.youtubeUrl}
                  onChange={(e) => updateVideo(index, 'youtubeUrl', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (mode === 'existing' && !selectedCourseId)}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {isLoading 
            ? 'Publishing...' 
            : mode === 'existing' 
              ? 'Add Videos to Course' 
              : 'Publish Video'
          }
        </button>
      </form>
    </div>
  )
}