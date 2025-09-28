import { useState, useEffect } from 'react'

interface UserMenuProps {
  isOpen: boolean
  onClose: () => void
  userAddress: string
}

export default function UserMenu({ isOpen, onClose, userAddress }: UserMenuProps) {
  const [profile, setProfile] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    web3_experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    project_name: '',
    bio: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && userAddress) {
      loadProfile()
    }
  }, [isOpen, userAddress])

  const loadProfile = async () => {
    try {
      const response = await fetch(`/api/profile?walletAddress=${userAddress}`)
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
        if (data) {
          setFormData({
            name: data.name || '',
            profession: data.profession || '',
            web3_experience: data.web3_experience || 'beginner',
            project_name: data.project_name || '',
            bio: data.bio || ''
          })
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': userAddress
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile)
        setIsEditing(false)
        alert('Profile saved successfully!')
      } else {
        alert('Error saving profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem('ctdhub:wallet')
    localStorage.removeItem('walletAddress')
    onClose()
    window.location.reload()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={onClose}
      />
      
      {/* Dropdown Menu */}
      <div className="fixed top-20 right-4 w-80 bg-gray-900 rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-700">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-white text-lg">
                Welcome, {profile?.name || 'User'}
              </h3>
              <p className="text-sm text-gray-300 font-mono">
                {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {!isEditing ? (
          /* Menu Items */
          <div className="py-2">
            {/* Edit Profile */}
            <div 
              className="px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700"
              onClick={() => setIsEditing(true)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-white font-medium">Edit Profile</span>
              </div>
            </div>

            {/* My Courses - Redirect to Dev Area */}
            <div 
              className="px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700"
              onClick={() => { onClose(); window.location.href = '/dev' }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                  </svg>
                </div>
                <span className="text-white font-medium">My Courses</span>
              </div>
            </div>

            {/* Browse Courses */}
            <div 
              className="px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700"
              onClick={() => { onClose(); window.location.href = '/courses' }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <span className="text-white font-medium">Browse Courses</span>
              </div>
            </div>

            {/* Take Quiz */}
            <div 
              className="px-4 py-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700"
              onClick={() => { onClose(); window.location.href = '/quiz' }}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
                  </svg>
                </div>
                <span className="text-white font-medium">Take Quiz</span>
              </div>
            </div>

            {/* Disconnect */}
            <div 
              className="px-4 py-3 hover:bg-red-800 cursor-pointer"
              onClick={handleDisconnect}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                </div>
                <span className="text-white font-medium">Disconnect</span>
              </div>
            </div>
          </div>
        ) : (
          /* Edit Profile Form */
          <div className="p-4 bg-gray-900">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Profession</label>
                <input
                  type="text"
                  value={formData.profession}
                  onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="Your profession"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Web3 Experience</label>
                <select
                  value={formData.web3_experience}
                  onChange={(e) => setFormData(prev => ({ ...prev, web3_experience: e.target.value as any }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Project Name</label>
                <input
                  type="text"
                  value={formData.project_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, project_name: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-white"
                  placeholder="Your current project"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 h-20 resize-none text-white"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  )
}