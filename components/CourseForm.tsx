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
  preSelectedCourseId?: string
}

export default function CourseForm({ onSubmit, onAddToExisting, existingCourses = [], isUpdate = false, preSelectedCourseId = '' }: CourseFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [videos, setVideos] = useState<VideoFormData[]>([
    { title: '', description: '', youtubeUrl: '' }
  ])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'new' | 'existing'>(preSelectedCourseId ? 'existing' : 'new')
  const [selectedCourseId, setSelectedCourseId] = useState(preSelectedCourseId)

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
        console.log('Adding to existing course:', selectedCourseId, validVideos)
        await onAddToExisting(selectedCourseId, validVideos)
      } else {
        if (!formData.title.trim() || !formData.description.trim()) {
          setError('Course title and description are required')
          return
        }
        console.log('Creating new course:', { ...formData, videos: validVideos })
        await onSubmit({ ...formData, videos: validVideos })
      }

      // Reset form
      setFormData({ title: '', description: '' })
      setVideos([{ title: '', description: '', youtubeUrl: '' }])
      setSelectedCourseId('')
      setMode('new')
    } catch (err: any) {
      console.error('Course form error:', err)
      setError(`Upload failed: ${err.message || 'Check the fields and try again.'}`)
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
    <div className="ctd-panel p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
      <div className="mb-8">
        <h3 className="text-2xl font-bold ctd-yellow mb-3">
          Create Course Content
        </h3>
        <p className="ctd-text opacity-80 text-base leading-relaxed ctd-panel p-4 rounded-lg border border-gray-200 dark:border-gray-600">
          📚 <strong className="ctd-yellow">Smart Organization:</strong> If your videos belong to the same course/module, 
          select "Add to Existing Course" instead of creating a new one. This keeps content organized!
        </p>
      </div>

      {myCourses.length > 0 && (
        <div className="mb-8">
          <div className="flex gap-4 mb-6">
            <button
              type="button"
              onClick={() => setMode('new')}
              className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
                mode === 'new' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
              }`}
            >
              🆕 New Course
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              className={`px-6 py-3 rounded-xl font-bold transition-all transform hover:scale-105 shadow-lg ${
                mode === 'existing' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white' 
                  : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
              }`}
            >
              ➕ Add to Existing
            </button>
          </div>

          {mode === 'existing' && (
            <div className="mb-6">
              <label className="block text-lg font-bold ctd-text mb-3">
                Select Your Course
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full px-4 py-4 ctd-panel border-2 border-gray-300 dark:border-gray-600 rounded-xl ctd-text focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {mode === 'new' && (
          <>
            <div>
              <label className="block text-lg font-bold ctd-text mb-3">
                Course Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-4 ctd-panel border-2 border-gray-300 dark:border-gray-600 rounded-xl ctd-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200"
                placeholder="e.g., Complete Blockchain Development"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-lg font-bold ctd-text mb-3">
                Course Description *
              </label>
              <textarea
                rows={4}
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-4 ctd-panel border-2 border-gray-300 dark:border-gray-600 rounded-xl ctd-text placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 resize-none"
                placeholder="Brief description of what students will learn..."
                disabled={isLoading}
              />
            </div>
          </>
        )}

        <div>
          <div className="flex items-center justify-between mb-6">
            <label className="block text-lg font-bold ctd-text">
              Course Videos *
            </label>
            <button
              type="button"
              onClick={addVideoField}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2 rounded-xl font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              + Add Video
            </button>
          </div>

          {videos.map((video, index) => (
            <div key={index} className="ctd-panel p-6 rounded-xl mb-6 border border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold ctd-text">
                  Video {index + 1}
                </h4>
                {videos.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeVideoField(index)}
                    className="text-red-400 hover:text-red-300 font-medium px-3 py-1 rounded-lg hover:bg-red-900/20 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Video title..."
                  value={video.title}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 backdrop-blur-sm"
                  disabled={isLoading}
                />
                
                <textarea
                  rows={3}
                  placeholder="Video description (optional)..."
                  value={video.description}
                  onChange={(e) => updateVideo(index, 'description', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 backdrop-blur-sm resize-none"
                  disabled={isLoading}
                />
                
                <input
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={video.youtubeUrl}
                  onChange={(e) => updateVideo(index, 'youtubeUrl', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-600/50 border border-gray-500/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-200 backdrop-blur-sm"
                  disabled={isLoading}
                />
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-900/30 border-2 border-red-500/50 rounded-xl backdrop-blur-sm">
            <p className="text-red-200 text-base font-medium">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || (mode === 'existing' && !selectedCourseId)}
          className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
          {isLoading 
            ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Publishing...
              </span>
            )
            : mode === 'existing' 
              ? 'Add Videos to Course' 
              : 'Publish Video'
          }
        </button>
      </form>
    </div>
  )
}