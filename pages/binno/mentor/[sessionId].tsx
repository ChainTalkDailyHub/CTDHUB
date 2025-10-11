import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { BinnoMentorSession } from '../../../lib/binno'

export default function BinnoMentorPage() {
  const router = useRouter()
  const { sessionId } = router.query
  
  const [mentorSession, setMentorSession] = useState<BinnoMentorSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentSection, setCurrentSection] = useState<'overview' | 'mistakes' | 'successes' | 'roadmap'>('overview')

  useEffect(() => {
    if (sessionId) {
      loadMentorSession()
    }
  }, [sessionId])

  const loadMentorSession = async () => {
    try {
      const response = await fetch('/api/binno/mentor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId })
      })

      const data = await response.json()
      
      if (response.ok) {
        setMentorSession(data.mentorSession)
      } else {
        throw new Error(data.error || 'Failed to load mentor session')
      }
    } catch (error) {
      console.error('Error loading mentor session:', error)
      alert('Failed to load mentor session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getExpertiseLevel = (level: number) => {
    if (level >= 90) return { label: 'Expert', color: 'text-purple-400', icon: '👑' }
    if (level >= 75) return { label: 'Advanced', color: 'text-blue-400', icon: '🎯' }
    if (level >= 50) return { label: 'Intermediate', color: 'text-yellow-400', icon: '📈' }
    if (level >= 25) return { label: 'Beginner', color: 'text-orange-400', icon: '🌱' }
    return { label: 'Novice', color: 'text-red-400', icon: '🚀' }
  }

  const sectionButtons = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'mistakes', label: 'Learning Points', icon: '🎯' },
    { id: 'successes', label: 'Successes', icon: '🏆' },
    { id: 'roadmap', label: 'Roadmap', icon: '🗺️' }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Binno is preparing your mentoring session...</h2>
          <p className="text-gray-400">Analyzing your simulation performance</p>
        </div>
      </div>
    )
  }

  if (!mentorSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-400">Unable to load mentor session</h2>
          <button
            onClick={() => router.push('/questionnaire')}
            className="px-6 py-3 bg-amber-500 text-black rounded-lg hover:bg-amber-600 transition-colors"
          >
            Return to CTD Skill Compass
          </button>
        </div>
      </div>
    )
  }

  const expertise = getExpertiseLevel(mentorSession.bnb_expertise_level)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 text-white">
      <Head>
        <title>Binno Mentoring Session - CTD Hub</title>
        <meta name="description" content="Personalized Web3 mentoring with AI" />
      </Head>

      {/* Header */}
      <div className="border-b border-gray-800 bg-gradient-to-r from-purple-900/30 to-blue-900/30">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-400 mb-2">
              🤖 Binno's Mentoring Session
            </h1>
            <p className="text-gray-300">Your personalized Web3 development feedback</p>
          </div>

          {/* Score Overview */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center bg-gray-800/50 rounded-lg p-6">
              <div className={`text-4xl font-bold ${getScoreColor(mentorSession.final_score)} mb-2`}>
                {mentorSession.final_score}
              </div>
              <div className="text-gray-400">Final Score</div>
            </div>
            
            <div className="text-center bg-gray-800/50 rounded-lg p-6">
              <div className={`text-4xl font-bold ${expertise.color} mb-2`}>
                {expertise.icon} {mentorSession.bnb_expertise_level}
              </div>
              <div className="text-gray-400">BNB Expertise</div>
            </div>
            
            <div className="text-center bg-gray-800/50 rounded-lg p-6">
              <div className={`text-2xl font-bold ${expertise.color} mb-2`}>
                {expertise.label}
              </div>
              <div className="text-gray-400">Level</div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {sectionButtons.map((section) => (
              <button
                key={section.id}
                onClick={() => setCurrentSection(section.id as any)}
                className={`px-6 py-3 rounded-lg transition-all duration-200 ${
                  currentSection === section.id
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          
          {/* Overview Section */}
          {currentSection === 'overview' && (
            <div className="space-y-8">
              <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-8 border border-purple-500/30">
                <h2 className="text-2xl font-bold text-purple-400 mb-4">
                  📊 Overall Assessment
                </h2>
                <p className="text-gray-300 leading-relaxed text-lg">
                  {mentorSession.overall_assessment}
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-red-900/20 rounded-lg p-6 border border-red-500/30">
                  <h3 className="text-xl font-bold text-red-400 mb-4 flex items-center">
                    🎯 Learning Opportunities
                    <span className="ml-2 bg-red-500/20 text-red-400 px-2 py-1 rounded-full text-sm">
                      {mentorSession.major_mistakes.length}
                    </span>
                  </h3>
                  <p className="text-gray-300">
                    {mentorSession.major_mistakes.length > 0 
                      ? "Several areas identified for improvement. Click 'Learning Points' to see detailed feedback."
                      : "Excellent! No major mistakes identified in your simulation."
                    }
                  </p>
                </div>

                <div className="bg-green-900/20 rounded-lg p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-green-400 mb-4 flex items-center">
                    🏆 Key Successes
                    <span className="ml-2 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-sm">
                      {mentorSession.key_successes.length}
                    </span>
                  </h3>
                  <p className="text-gray-300">
                    {mentorSession.key_successes.length > 0
                      ? "Great decisions identified! Click 'Successes' to see what you did well."
                      : "Let's work on identifying more successful strategies in your next simulation."
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mistakes Section */}
          {currentSection === 'mistakes' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-red-400 mb-6">
                🎯 Learning Opportunities
              </h2>
              
              {mentorSession.major_mistakes.length === 0 ? (
                <div className="bg-green-900/20 rounded-lg p-8 border border-green-500/30 text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h3 className="text-2xl font-bold text-green-400 mb-2">Outstanding Performance!</h3>
                  <p className="text-gray-300">No major mistakes identified in your simulation. You demonstrated excellent Web3 strategic thinking!</p>
                </div>
              ) : (
                mentorSession.major_mistakes.map((mistake, index) => (
                  <div key={index} className="bg-red-900/20 rounded-lg p-6 border border-red-500/30">
                    <h3 className="text-xl font-bold text-red-400 mb-3">
                      Issue #{index + 1}: {mistake.mistake_description}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">💡 Better Approach:</h4>
                        <p className="text-gray-300">{mistake.correct_approach}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">🌍 Real-World Example:</h4>
                        <p className="text-gray-300">{mistake.real_world_example}</p>
                      </div>
                      
                      {mistake.learning_resources.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-purple-400 mb-2">📚 Learning Resources:</h4>
                          <ul className="space-y-1">
                            {mistake.learning_resources.map((resource, resIndex) => (
                              <li key={resIndex} className="text-gray-300 flex items-start">
                                <span className="text-purple-400 mr-2">•</span>
                                {resource}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Successes Section */}
          {currentSection === 'successes' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-green-400 mb-6">
                🏆 Your Successes
              </h2>
              
              {mentorSession.key_successes.length === 0 ? (
                <div className="bg-gray-800/50 rounded-lg p-8 border border-gray-600 text-center">
                  <div className="text-6xl mb-4">🎯</div>
                  <h3 className="text-2xl font-bold text-gray-400 mb-2">Room for Growth</h3>
                  <p className="text-gray-300">No major successes identified yet. This is a great learning opportunity for your next simulation!</p>
                </div>
              ) : (
                mentorSession.key_successes.map((success, index) => (
                  <div key={index} className="bg-green-900/20 rounded-lg p-6 border border-green-500/30">
                    <h3 className="text-xl font-bold text-green-400 mb-3">
                      Success #{index + 1}: {success.success_description}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-yellow-400 mb-2">🎯 Why It Worked:</h4>
                        <p className="text-gray-300">{success.why_it_worked}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold text-cyan-400 mb-2">🚀 How to Improve Further:</h4>
                        <p className="text-gray-300">{success.how_to_improve_further}</p>
                      </div>
                      
                      {success.advanced_strategies.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-purple-400 mb-2">⚡ Advanced Strategies:</h4>
                          <ul className="space-y-1">
                            {success.advanced_strategies.map((strategy, stratIndex) => (
                              <li key={stratIndex} className="text-gray-300 flex items-start">
                                <span className="text-purple-400 mr-2">•</span>
                                {strategy}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Roadmap Section */}
          {currentSection === 'roadmap' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-blue-400 mb-6">
                🗺️ Your Personalized Learning Roadmap
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-blue-900/20 rounded-lg p-6 border border-blue-500/30">
                  <h3 className="text-xl font-bold text-blue-400 mb-4">📈 Immediate Next Steps</h3>
                  <ul className="space-y-3">
                    {mentorSession.next_learning_steps.map((step, index) => (
                      <li key={index} className="text-gray-300 flex items-start">
                        <span className="text-blue-400 mr-3 font-bold">{index + 1}.</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-purple-900/20 rounded-lg p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-purple-400 mb-4">🎯 Long-term Development</h3>
                  <ul className="space-y-3">
                    {mentorSession.personalized_roadmap.map((item, index) => (
                      <li key={index} className="text-gray-300 flex items-start">
                        <span className="text-purple-400 mr-3">🔹</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-amber-900/20 rounded-lg p-6 border border-amber-500/30">
                <h3 className="text-xl font-bold text-amber-400 mb-4">
                  🎓 Binno's Final Advice
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  Remember, becoming a successful Web3 entrepreneur is a journey, not a destination. 
                  Each simulation teaches you something new. Keep practicing, stay curious about new 
                  technologies, and always prioritize your community and security. The BNB Chain 
                  ecosystem offers incredible opportunities for those who understand it deeply.
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => router.push('/questionnaire')}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200"
                >
                  Try CTD Skill Compass
                </button>
                <button
                  onClick={() => router.push('/binno-ai')}
                  className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                >
                  Chat with AI
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}