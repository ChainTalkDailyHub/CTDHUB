import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { SimulationSession, ProjectOutcome, ProjectScore } from '../../../lib/simulator'

export default function SimulationResultsPage() {
  const router = useRouter()
  const { sessionId } = router.query
  
  const [session, setSession] = useState<SimulationSession | null>(null)
  const [outcome, setOutcome] = useState<ProjectOutcome | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (sessionId) {
      loadResults()
    }
  }, [sessionId])

  const loadResults = async () => {
    try {
      const response = await fetch(`/api/simulator/session/${sessionId}`)
      if (!response.ok) {
        throw new Error('Session not found')
      }
      const data = await response.json()
      setSession(data.session)
      setOutcome(data.session.final_outcome)
    } catch (error) {
      console.error('Error loading results:', error)
      router.push('/simulator')
    } finally {
      setIsLoading(false)
    }
  }

  const getSuccessProbabilityColor = (probability: number) => {
    if (probability >= 80) return 'text-green-400'
    if (probability >= 60) return 'text-yellow-400'
    if (probability >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getSuccessProbabilityGradient = (probability: number) => {
    if (probability >= 80) return 'from-green-400 to-green-500'
    if (probability >= 60) return 'from-yellow-400 to-yellow-500'
    if (probability >= 40) return 'from-orange-400 to-orange-500'
    return 'from-red-400 to-red-500'
  }

  const shareResults = () => {
    const text = `I just simulated launching "${session?.project_name}" on BNB Chain and got a ${outcome?.success_probability}% success probability! Try the Web3 Project Launch Simulator at CTD Hub.`
    
    if (navigator.share) {
      navigator.share({
        title: 'Web3 Project Launch Simulator Results',
        text,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(`${text} ${window.location.href}`)
      alert('Results copied to clipboard!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading results...</div>
        </div>
      </div>
    )
  }

  if (!session || !outcome) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Results not found</div>
          <button
            onClick={() => router.push('/simulator')}
            className="bg-amber-400 hover:bg-amber-500 text-black px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Back to Simulator
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{session.project_name} Results - Web3 Simulator - CTD Hub</title>
        <meta name="description" content={`Simulation results for ${session.project_name}: ${outcome.success_probability}% success probability`} />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-16">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 bg-green-400/10 border border-green-400/20 rounded-full px-4 py-2 mb-6">
                <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-green-400 text-sm font-medium">Simulation Complete</span>
              </div>
              
              <h1 className="text-5xl font-bold mb-4">{session.project_name}</h1>
              <p className="text-xl text-gray-300 capitalize">
                {session.project_type.replace('_', ' ')} • BNB Chain
              </p>
            </div>

            {/* Main Results */}
            <div className="grid lg:grid-cols-3 gap-8 mb-12">
              {/* Success Probability */}
              <div className="lg:col-span-2">
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm text-center">
                  <div className="mb-6">
                    <div className="text-lg text-gray-400 mb-2">Success Probability</div>
                    <div className={`text-8xl font-bold mb-4 ${getSuccessProbabilityColor(outcome.success_probability)}`}>
                      {outcome.success_probability}%
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-4 mb-4">
                      <div 
                        className={`bg-gradient-to-r ${getSuccessProbabilityGradient(outcome.success_probability)} h-4 rounded-full transition-all duration-1000`}
                        style={{ width: `${outcome.success_probability}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 text-center">
                    <div>
                      <div className="text-2xl font-bold text-cyan-400 mb-1">{outcome.predicted_market_cap}</div>
                      <div className="text-sm text-gray-400">Predicted Market Cap</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-amber-400 mb-1">{outcome.time_to_break_even}m</div>
                      <div className="text-sm text-gray-400">Time to Break Even</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* BNB Ecosystem Fit */}
              <div className="bg-gradient-to-br from-amber-400/10 to-cyan-400/10 border border-amber-400/20 rounded-2xl p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
                    <span className="text-amber-400 font-medium">BNB Chain Fit</span>
                  </div>
                  <div className="text-5xl font-bold text-cyan-400 mb-4">
                    {outcome.bnb_ecosystem_fit}%
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-amber-400 to-cyan-400 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${outcome.bnb_ecosystem_fit}%` }}
                    ></div>
                  </div>
                  <div className="text-sm text-gray-300 mt-3">
                    Your project's alignment with BNB ecosystem
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="grid lg:grid-cols-2 gap-8 mb-12">
              {/* Strengths & Weaknesses */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-green-400 mb-4">Main Strengths</h3>
                  <div className="space-y-3">
                    {outcome.main_strengths.map((strength, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-orange-400 mb-4">Areas for Improvement</h3>
                  <div className="space-y-3">
                    {outcome.main_weaknesses.map((weakness, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-orange-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">{weakness}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations & Comparisons */}
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-cyan-400 mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {outcome.recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-300">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <h3 className="text-xl font-bold text-amber-400 mb-4">Comparable Projects</h3>
                  <div className="flex flex-wrap gap-2">
                    {outcome.comparable_projects.map((project, index) => (
                      <span 
                        key={index}
                        className="bg-amber-400/10 border border-amber-400/20 text-amber-400 px-3 py-1 rounded-full text-sm"
                      >
                        {project}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Final Score Breakdown */}
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-8 backdrop-blur-sm mb-12">
              <h3 className="text-2xl font-bold mb-6 text-center">Final Score Breakdown</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Object.entries(session.current_score).map(([key, value]) => {
                  if (key === 'overall') return null
                  return (
                    <div key={key} className="text-center">
                      <div className="text-sm text-gray-400 mb-2 capitalize">
                        {key.replace('_', ' ')}
                      </div>
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke="rgb(55 65 81)"
                            strokeWidth="2"
                          />
                          <path
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                            fill="none"
                            stroke={key === 'bnb_integration' ? 'rgb(251 191 36)' : 'rgb(34 197 94)'}
                            strokeWidth="2"
                            strokeDasharray={`${value}, 100`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">{value}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push('/simulator')}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Try Another Simulation
              </button>
              
              <button
                onClick={shareResults}
                className="bg-gradient-to-r from-cyan-400 to-cyan-500 hover:from-cyan-500 hover:to-cyan-600 text-black px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Share Results
              </button>
              
              <button
                onClick={() => router.push('/simulator/leaderboard')}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
              >
                View Leaderboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}