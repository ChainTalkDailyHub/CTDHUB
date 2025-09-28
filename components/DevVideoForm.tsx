import { useState } from 'react'

interface DevVideoFormProps {
  onSubmit: (data: { title: string; description: string; youtubeUrl: string }) => Promise<void>
}

export default function DevVideoForm({ onSubmit }: DevVideoFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title.trim() || !formData.youtubeUrl.trim()) {
      setError('Title and YouTube URL are required')
      return
    }

    // Basic YouTube URL validation
    const ytPattern = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
    if (!ytPattern.test(formData.youtubeUrl)) {
      setError('Please enter a valid YouTube URL')
      return
    }

    try {
      setIsLoading(true)
      await onSubmit(formData)
      setFormData({ title: '', description: '', youtubeUrl: '' })
    } catch (err: any) {
      setError(err.message || 'Failed to submit video')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Submit New Video</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="Enter video title"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            placeholder="Brief description of your video (optional)"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            YouTube URL *
          </label>
          <input
            type="url"
            required
            value={formData.youtubeUrl}
            onChange={(e) => setFormData(prev => ({ ...prev, youtubeUrl: e.target.value }))}
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
            placeholder="https://youtube.com/watch?v=..."
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
        >
          {isLoading ? 'Publishing...' : 'Publish Video'}
        </button>
      </form>
    </div>
  )
}