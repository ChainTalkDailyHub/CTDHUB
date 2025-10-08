import { useState, useEffect } from 'react'

interface UserMenuProps {
  isOpen: boolean
  onClose: () => void
  userAddress: string
}

export default function UserMenu({ isOpen, onClose, userAddress }: UserMenuProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    web3_experience: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'expert',
    project_name: '',
    bio: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  // Load profile when menu opens
  useEffect(() => {
    if (isOpen && userAddress) {
      loadProfile()
    }
  }, [isOpen, userAddress])

  const loadProfile = async () => {
    try {
      // Use Netlify Function for profile data
      const response = await fetch(`/.netlify/functions/user-profiles?walletAddress=${userAddress}`)
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
      console.log('Saving profile for address:', userAddress)
      console.log('Profile data:', formData)

      // Use Netlify Function for saving profile
      const response = await fetch('/.netlify/functions/user-profiles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-address': userAddress
        },
        body: JSON.stringify(formData)
      })

      console.log('Response status:', response.status)
      
      if (response.ok) {
        const updatedProfile = await response.json()
        console.log('Profile saved successfully:', updatedProfile)
        setProfile(updatedProfile)
        setIsEditing(false)
        alert('✅ Profile saved successfully!')
      } else {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        
        let errorMessage = 'Unknown error'
        try {
          const errorJson = JSON.parse(errorText)
          errorMessage = errorJson.error || errorMessage
        } catch {
          errorMessage = errorText
        }
        
        alert(`❌ Error saving profile: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Network error saving profile:', error)
      alert('❌ Network error saving profile. Please check your connection and try again.')
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
    <div className="fixed inset-0 z-[9999] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="absolute right-0 top-0 h-screen w-80 bg-gray-900 shadow-2xl border-l border-gray-700">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700 bg-gray-800">
            <h2 className="text-xl font-bold text-white">User Menu</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-900">
            {!isEditing ? (
              <div className="space-y-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <h3 className="text-sm font-semibold text-gray-300 mb-1">Connected Wallet</h3>
                  <p className="text-white font-mono text-sm">
                    {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                  </p>
                </div>

                {/* Edit Profile Button */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full p-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                  <div className="text-left">
                    <p className="font-bold text-lg">Edit Profile</p>
                    <p className="text-sm opacity-80">Update your information</p>
                  </div>
                </button>

                {/* Data Migration Button */}
                <a
                  href="/data-migration"
                  onClick={onClose}
                  className="w-full p-5 bg-yellow-600 hover:bg-yellow-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <div className="text-left">
                    <p className="font-bold text-lg">Data Migration</p>
                    <p className="text-sm opacity-80">Backup & protect your content</p>
                  </div>
                </a>

                {/* Disconnect Button */}
                <button
                  onClick={handleDisconnect}
                  className="w-full p-5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all duration-200 flex items-center space-x-3 shadow-lg hover:shadow-xl"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                  <div className="text-left">
                    <p className="font-bold text-lg">Disconnect Wallet</p>
                    <p className="text-sm opacity-80">Sign out securely</p>
                  </div>
                </button>

                {/* Show current profile if exists */}
                {profile && (
                  <div className="mt-6 space-y-3 pt-4 border-t border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase">Current Profile</h3>
                    {profile.name && (
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400 uppercase">Name</p>
                        <p className="text-white">{profile.name}</p>
                      </div>
                    )}
                    {profile.profession && (
                      <div className="bg-gray-800 p-3 rounded">
                        <p className="text-xs text-gray-400 uppercase">Profession</p>
                        <p className="text-white">{profile.profession}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {/* Edit Form Header */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Edit Profile</h3>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    Cancel
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Profession</label>
                    <input
                      type="text"
                      value={formData.profession}
                      onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Your profession"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Web3 Experience</label>
                    <select
                      value={formData.web3_experience}
                      onChange={(e) => setFormData(prev => ({ ...prev, web3_experience: e.target.value as any }))}
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
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
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none"
                      placeholder="Your current project"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full p-3 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 focus:outline-none h-20 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Profile'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}