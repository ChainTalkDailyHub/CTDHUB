import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { ProjectType } from '../../lib/simulator'

export default function SimulatorPage() {
  const router = useRouter()
  const [userAddress, setUserAddress] = useState<string>('')
  const [showStartModal, setShowStartModal] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [projectType, setProjectType] = useState<ProjectType>('defi_protocol')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is connected
    const address = localStorage.getItem('ctdhub:wallet')
    if (address) {
      setUserAddress(address)
    } else {
      // Redirect to home if not connected
      router.push('/')
    }
  }, [router])

  const projectTypes: { value: ProjectType; label: string; description: string; bnbFit: number }[] = [
    {
      value: 'defi_protocol',
      label: 'DeFi Protocol',
      description: 'Decentralized Finance protocol optimized for BNB Chain',
      bnbFit: 95
    },
    {
      value: 'yield_farming',
      label: 'Yield Farming',
      description: 'Yield optimization platform leveraging BNB ecosystem',
      bnbFit: 90
    },
    {
      value: 'cross_chain_bridge',
      label: 'Cross-Chain Bridge',
      description: 'Bridge connecting other chains to BNB Chain',
      bnbFit: 85
    },
    {
      value: 'gaming_dapp',
      label: 'GameFi Platform',
      description: 'Gaming platform with BNB rewards and NFTs',
      bnbFit: 80
    },
    {
      value: 'nft_marketplace',
      label: 'NFT Marketplace',
      description: 'NFT marketplace built on BSC with BNB transactions',
      bnbFit: 75
    },
    {
      value: 'dao_governance',
      label: 'DAO Platform',
      description: 'Governance platform with BNB-weighted voting',
      bnbFit: 70
    },
    {
      value: 'metaverse_platform',
      label: 'Metaverse Platform',
      description: 'Virtual world with BNB-based economy',
      bnbFit: 65
    },
    {
      value: 'social_token',
      label: 'Social Token',
      description: 'Community token with BNB ecosystem integration',
      bnbFit: 60
    }
  ]

  const startSimulation = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/simulator/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAddress,
          projectName: projectName.trim(),
          projectType
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create simulation session')
      }

      const { sessionId } = await response.json()
      router.push(`/simulator/session/${sessionId}`)
    } catch (error) {
      console.error('Error starting simulation:', error)
      alert('Failed to start simulation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getBNBFitColor = (fit: number) => {
    if (fit >= 90) return 'text-green-400'
    if (fit >= 80) return 'text-yellow-400'
    if (fit >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <>
      <Head>
        <title>Web3 Project Launch Simulator - CTD Hub</title>
        <meta name="description" content="Simulate launching your Web3 project on BNB Chain. Learn optimal strategies, avoid common pitfalls, and maximize your success probability." />
      </Head>

      <div className="min-h-screen bg-black text-white">
        {/* Hero Section */}
        <div className="relative">
          {/* Spotlight Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>

          <div className="relative max-w-6xl mx-auto px-6 py-20">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-2 mb-6">
                <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                <span className="text-amber-400 text-sm font-medium">BNB Chain Optimized</span>
              </div>
              
              <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
                Web3 Project Launch Simulator
              </h1>
              
              <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
                Master the art of launching successful Web3 projects on BNB Chain. 
                Simulate real-world decisions, learn from outcomes, and optimize your strategy 
                before risking real capital.
              </p>

              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                  <span>Real market scenarios</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-amber-400 rounded-full"></div>
                  <span>BNB ecosystem focus</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-cyan-400 rounded-full"></div>
                  <span>Expert-validated outcomes</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-16">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-amber-400 mb-2">95%</div>
                <div className="text-gray-300">Success Rate Improvement</div>
                <div className="text-sm text-gray-500 mt-1">For BNB-optimized projects</div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-cyan-400 mb-2">50+</div>
                <div className="text-gray-300">Decision Points</div>
                <div className="text-sm text-gray-500 mt-1">Covering entire launch journey</div>
              </div>
              
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="text-3xl font-bold text-amber-400 mb-2">$2M+</div>
                <div className="text-gray-300">Average Market Cap</div>
                <div className="text-sm text-gray-500 mt-1">For simulated projects</div>
              </div>
            </div>

            {/* Feature Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm group hover:border-amber-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-400/30 transition-colors">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Real-Time Scoring</h3>
                <p className="text-gray-400 text-sm">Dynamic scoring based on your decisions with BNB ecosystem bonus points</p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm group hover:border-cyan-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-400/30 transition-colors">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">BNB Chain Native</h3>
                <p className="text-gray-400 text-sm">Scenarios specifically designed for BNB Chain ecosystem success</p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm group hover:border-amber-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-amber-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-400/30 transition-colors">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Market Predictions</h3>
                <p className="text-gray-400 text-sm">AI-powered predictions based on comparable BNB Chain projects</p>
              </div>

              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm group hover:border-cyan-400/50 transition-all duration-300">
                <div className="w-12 h-12 bg-cyan-400/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-cyan-400/30 transition-colors">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Achievement System</h3>
                <p className="text-gray-400 text-sm">Unlock badges and climb leaderboards as you master Web3 launches</p>
              </div>
            </div>

            {/* CTA Section */}
            <div className="text-center">
              <button
                onClick={() => setShowStartModal(true)}
                className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-400/25"
              >
                Start Your Simulation
              </button>
              
              <p className="text-gray-400 text-sm mt-4">
                Free to use • No registration required • Wallet connection only
              </p>
            </div>
          </div>
        </div>

        {/* Start Simulation Modal */}
        {showStartModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-white">Create Your Project</h2>
                  <button
                    onClick={() => setShowStartModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Project Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project Name
                    </label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="Enter your Web3 project name"
                      className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-400/20"
                      maxLength={50}
                    />
                  </div>

                  {/* Project Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-3">
                      Project Type
                    </label>
                    <div className="grid gap-3">
                      {projectTypes.map((type) => (
                        <label
                          key={type.value}
                          className={`
                            cursor-pointer border rounded-lg p-4 transition-all duration-300
                            ${projectType === type.value
                              ? 'border-amber-400 bg-amber-400/10'
                              : 'border-gray-600 bg-gray-800/30 hover:border-gray-500'
                            }
                          `}
                        >
                          <input
                            type="radio"
                            name="projectType"
                            value={type.value}
                            checked={projectType === type.value}
                            onChange={(e) => setProjectType(e.target.value as ProjectType)}
                            className="sr-only"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="text-white font-medium mb-1">{type.label}</div>
                              <div className="text-gray-400 text-sm">{type.description}</div>
                            </div>
                            <div className="ml-4 text-right">
                              <div className="text-xs text-gray-500 mb-1">BNB Fit</div>
                              <div className={`text-lg font-bold ${getBNBFitColor(type.bnbFit)}`}>
                                {type.bnbFit}%
                              </div>
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* BNB Chain Benefits */}
                  <div className="bg-gradient-to-r from-amber-400/10 to-cyan-400/10 border border-amber-400/20 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
                      <span className="text-amber-400 font-medium text-sm">BNB Chain Advantage</span>
                    </div>
                    <p className="text-gray-300 text-sm">
                      Projects optimized for BNB Chain receive bonus scoring for leveraging 
                      fast transactions, low fees, and the rich DeFi ecosystem.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => setShowStartModal(false)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={startSimulation}
                      disabled={!projectName.trim() || isLoading}
                      className="flex-1 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 disabled:from-gray-600 disabled:to-gray-600 text-black px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Creating...' : 'Start Simulation'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}