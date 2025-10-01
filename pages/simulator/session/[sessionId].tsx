import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { 
  SimulationSession, 
  SimulationDecision, 
  SimulationOption, 
  ProjectScore,
  SimulationStage 
} from '../../../lib/simulator'
import { getStageDecisions, getNextStage } from '../../../lib/simulatorDecisions'

export default function SimulationSessionPage() {
  const router = useRouter()
  const { sessionId } = router.query
  
  const [session, setSession] = useState<SimulationSession | null>(null)
  const [currentDecisions, setCurrentDecisions] = useState<SimulationDecision[]>([])
  const [selectedDecision, setSelectedDecision] = useState<SimulationDecision | null>(null)
  const [selectedOption, setSelectedOption] = useState<SimulationOption | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (sessionId) {
      loadSession()
    }
  }, [sessionId])

  useEffect(() => {
    if (session) {
      loadCurrentDecisions()
    }
  }, [session])

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/simulator/session/${sessionId}`)
      if (!response.ok) {
        throw new Error('Session not found')
      }
      const data = await response.json()
      setSession(data.session)
    } catch (error) {
      console.error('Error loading session:', error)
      router.push('/simulator')
    } finally {
      setIsLoading(false)
    }
  }

  const loadCurrentDecisions = () => {
    if (!session) return
    
    const decisions = getStageDecisions(session.current_stage)
    // Filter out decisions already made
    const madeDecisionIds = session.decisions_made.map(d => d.decision_id)
    const availableDecisions = decisions.filter(d => !madeDecisionIds.includes(d.id))
    
    setCurrentDecisions(availableDecisions)
    
    // Auto-select first decision if available
    if (availableDecisions.length > 0) {
      setSelectedDecision(availableDecisions[0])
    }
  }

  const makeDecision = async () => {
    if (!session || !selectedDecision || !selectedOption) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/simulator/make-decision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: session.id,
          decisionId: selectedDecision.id,
          optionId: selectedOption.id,
          option: selectedOption
        })
      })

      if (!response.ok) {
        throw new Error('Failed to make decision')
      }

      const { session: updatedSession } = await response.json()
      setSession(updatedSession)
      setSelectedOption(null)
      
      // Check if stage is complete
      const remainingDecisions = currentDecisions.filter(d => d.id !== selectedDecision.id)
      setCurrentDecisions(remainingDecisions)
      
      if (remainingDecisions.length > 0) {
        setSelectedDecision(remainingDecisions[0])
      } else {
        // Move to next stage or complete simulation
        await advanceStage(updatedSession)
      }
    } catch (error) {
      console.error('Error making decision:', error)
      alert('Failed to make decision. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const advanceStage = async (currentSession: SimulationSession) => {
    const nextStage = getNextStage(currentSession.current_stage)
    
    if (!nextStage) {
      // Complete simulation
      await completeSimulation(currentSession)
      return
    }

    try {
      const response = await fetch(`/api/simulator/advance-stage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSession.id,
          nextStage
        })
      })

      if (!response.ok) {
        throw new Error('Failed to advance stage')
      }

      const { session: updatedSession } = await response.json()
      setSession(updatedSession)
    } catch (error) {
      console.error('Error advancing stage:', error)
    }
  }

  const completeSimulation = async (currentSession: SimulationSession) => {
    try {
      const response = await fetch(`/api/simulator/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSession.id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to complete simulation')
      }

      const { session: completedSession, outcome } = await response.json()
      router.push(`/simulator/results/${completedSession.id}`)
    } catch (error) {
      console.error('Error completing simulation:', error)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    if (score >= 40) return 'text-orange-400'
    return 'text-red-400'
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'text-green-400'
      case 'medium': return 'text-yellow-400'
      case 'high': return 'text-orange-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const stageLabels: Record<SimulationStage, string> = {
    ideation: 'Ideation',
    development: 'Development',
    tokenomics: 'Tokenomics',
    community_building: 'Community Building',
    partnerships: 'Partnerships',
    pre_launch: 'Pre-Launch',
    launch: 'Launch',
    post_launch: 'Post-Launch'
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading simulation...</div>
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Session not found</div>
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
        <title>{session.project_name} - Web3 Simulator - CTD Hub</title>
        <meta name="description" content={`Simulating launch strategy for ${session.project_name} on BNB Chain`} />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{session.project_name}</h1>
                <div className="text-gray-400">
                  {stageLabels[session.current_stage]} • {session.project_type.replace('_', ' ')}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-400 mb-1">Overall Score</div>
                <div className={`text-3xl font-bold ${getScoreColor(session.current_score.overall)}`}>
                  {session.current_score.overall}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-cyan-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((session.decisions_made.length / 16) * 100)}%` }}
                ></div>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {session.decisions_made.length} of ~16 decisions made
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Decision Panel */}
            <div className="lg:col-span-2">
              {selectedDecision ? (
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                  <div className="mb-6">
                    <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-3 py-1 mb-3">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                      <span className="text-amber-400 text-xs font-medium uppercase tracking-wider">
                        {stageLabels[selectedDecision.stage]}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold mb-3">{selectedDecision.title}</h2>
                    <p className="text-gray-300">{selectedDecision.description}</p>
                  </div>

                  <div className="space-y-4">
                    {selectedDecision.options.map((option) => (
                      <label
                        key={option.id}
                        className={`
                          block cursor-pointer border rounded-xl p-4 transition-all duration-300
                          ${selectedOption?.id === option.id
                            ? 'border-amber-400 bg-amber-400/10'
                            : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="decision_option"
                          value={option.id}
                          checked={selectedOption?.id === option.id}
                          onChange={() => setSelectedOption(option)}
                          className="sr-only"
                        />
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="text-white font-medium mb-2">{option.text}</div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Risk:</span>
                                <span className={getRiskColor(option.risk_level)}>{option.risk_level}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">Cost:</span>
                                <span className="text-amber-400">{option.cost > 0 ? `$${option.cost}k` : 'Free'}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-gray-400">BNB Fit:</span>
                                <span className="text-cyan-400">{option.bnb_relevance}%</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {selectedOption?.id === option.id && (
                          <div className="mt-4 pt-4 border-t border-gray-600">
                            <div className="text-sm text-gray-300 mb-2">Expected Impact:</div>
                            <div className="space-y-2">
                              {option.impact.map((impact, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <span className="text-gray-400 capitalize">
                                    {impact.area.replace('_', ' ')}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className={impact.value > 0 ? 'text-green-400' : 'text-red-400'}>
                                      {impact.value > 0 ? '+' : ''}{impact.value}
                                    </span>
                                    <div className="w-16 bg-gray-700 rounded-full h-1">
                                      <div 
                                        className={`h-1 rounded-full ${impact.value > 0 ? 'bg-green-400' : 'bg-red-400'}`}
                                        style={{ width: `${Math.abs(impact.value)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </label>
                    ))}
                  </div>

                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => router.push('/simulator')}
                      className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Exit Simulation
                    </button>
                    <button
                      onClick={makeDecision}
                      disabled={!selectedOption || isSubmitting}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-600 text-black px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? 'Processing...' : 'Make Decision'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-8 text-center backdrop-blur-sm">
                  <div className="text-2xl font-bold mb-4">Stage Complete!</div>
                  <div className="text-gray-300 mb-6">
                    You've completed all decisions for the {stageLabels[session.current_stage]} stage.
                  </div>
                  <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              )}
            </div>

            {/* Score Panel */}
            <div className="space-y-6">
              {/* Current Scores */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4">Project Health</h3>
                <div className="space-y-3">
                  {Object.entries(session.current_score).map(([key, value]) => {
                    if (key === 'overall') return null
                    return (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-300 text-sm capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                value >= 80 ? 'bg-green-400' :
                                value >= 60 ? 'bg-yellow-400' :
                                value >= 40 ? 'bg-orange-400' : 'bg-red-400'
                              }`}
                              style={{ width: `${value}%` }}
                            ></div>
                          </div>
                          <span className={`text-sm font-medium w-8 text-right ${getScoreColor(value)}`}>
                            {value}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* BNB Chain Integration */}
              <div className="bg-gradient-to-br from-amber-400/10 to-cyan-400/10 border border-amber-400/20 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                  <h3 className="text-lg font-semibold text-amber-400">BNB Chain Integration</h3>
                </div>
                <div className="text-3xl font-bold text-cyan-400 mb-2">
                  {session.current_score.bnb_integration}%
                </div>
                <div className="text-sm text-gray-300">
                  Your project's alignment with BNB Chain ecosystem
                </div>
              </div>

              {/* Recent Decisions */}
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-4">Recent Decisions</h3>
                <div className="space-y-3">
                  {session.decisions_made.slice(-3).reverse().map((decision, index) => (
                    <div key={index} className="text-sm">
                      <div className="text-gray-400">{stageLabels[decision.stage]}</div>
                      <div className="text-white">{decision.decision_id.replace('_', ' ')}</div>
                    </div>
                  ))}
                  {session.decisions_made.length === 0 && (
                    <div className="text-gray-400 text-sm">No decisions made yet</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}