import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import { GlobalLeaderboard, UserSimulatorStats } from '../../lib/simulator'

export default function LeaderboardPage() {
  const router = useRouter()
  const [leaderboard, setLeaderboard] = useState<GlobalLeaderboard[]>([])
  const [userStats, setUserStats] = useState<UserSimulatorStats | null>(null)
  const [userAddress, setUserAddress] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const address = localStorage.getItem('connectedWallet')
    if (address) {
      setUserAddress(address)
    }
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const response = await fetch('/api/simulator/leaderboard')
      if (response.ok) {
        const data = await response.json()
        setLeaderboard(data.leaderboard)
        
        // Load user stats if connected
        const address = localStorage.getItem('connectedWallet')
        if (address) {
          const userResponse = await fetch(`/api/simulator/user-stats?address=${address}`)
          if (userResponse.ok) {
            const userData = await userResponse.json()
            setUserStats(userData.stats)
          }
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400'
    if (rank === 2) return 'text-gray-300'
    if (rank === 3) return 'text-orange-400'
    return 'text-gray-400'
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '👑'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getBNBExpertiseLevel = (expertise: number) => {
    if (expertise >= 90) return { label: 'BNB Master', color: 'text-amber-400' }
    if (expertise >= 75) return { label: 'BNB Expert', color: 'text-cyan-400' }
    if (expertise >= 50) return { label: 'BNB Pro', color: 'text-green-400' }
    if (expertise >= 25) return { label: 'BNB Learner', color: 'text-yellow-400' }
    return { label: 'BNB Novice', color: 'text-gray-400' }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-white text-lg">Loading leaderboard...</div>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>Web3 Simulator Leaderboard - CTD Hub</title>
        <meta name="description" content="Top performers in the Web3 Project Launch Simulator. See who masters BNB Chain project launches best." />
      </Head>

      <div className="min-h-screen bg-black text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/20 rounded-full px-4 py-2 mb-6">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-amber-400 text-sm font-medium">Global Rankings</span>
            </div>
            
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-cyan-400 to-amber-400 bg-clip-text text-transparent">
              Simulator Leaderboard
            </h1>
            
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Top Web3 project strategists who've mastered the art of launching on BNB Chain
            </p>
          </div>

          {/* User Stats (if connected) */}
          {userStats && (
            <div className="bg-gradient-to-br from-amber-400/10 to-cyan-400/10 border border-amber-400/20 rounded-xl p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white">Your Stats</h2>
                <div className={`px-3 py-1 rounded-full text-sm ${getBNBExpertiseLevel(userStats.bnb_expertise_level).color} bg-gray-800`}>
                  {getBNBExpertiseLevel(userStats.bnb_expertise_level).label}
                </div>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-400 mb-1">{userStats.best_score}</div>
                  <div className="text-sm text-gray-400">Best Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{userStats.total_simulations}</div>
                  <div className="text-sm text-gray-400">Simulations</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-400 mb-1">{userStats.average_score}</div>
                  <div className="text-sm text-gray-400">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{userStats.achievements?.length || 0}</div>
                  <div className="text-sm text-gray-400">Achievements</div>
                </div>
              </div>
            </div>
          )}

          {/* Leaderboard */}
          <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl backdrop-blur-sm overflow-hidden">
            <div className="p-6 border-b border-gray-700/50">
              <h2 className="text-2xl font-bold text-white">Top BNB Chain Strategists</h2>
              <p className="text-gray-400 mt-1">Ranked by highest simulation score</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium">Rank</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Address</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Best Score</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Simulations</th>
                    <th className="text-left p-4 text-gray-400 font-medium">BNB Expertise</th>
                    <th className="text-left p-4 text-gray-400 font-medium">Achievements</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr 
                      key={user.user_address}
                      className={`
                        border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors
                        ${user.user_address.toLowerCase() === userAddress.toLowerCase() ? 'bg-amber-400/5' : ''}
                      `}
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg ${getRankColor(user.rank)}`}>
                            {getRankIcon(user.rank)}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`
                            font-mono text-sm
                            ${user.user_address.toLowerCase() === userAddress.toLowerCase() 
                              ? 'text-amber-400 font-medium' 
                              : 'text-gray-300'
                            }
                          `}>
                            {formatAddress(user.user_address)}
                          </span>
                          {user.user_address.toLowerCase() === userAddress.toLowerCase() && (
                            <span className="text-xs bg-amber-400 text-black px-2 py-0.5 rounded-full font-medium">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-xl font-bold text-green-400">
                          {user.best_score}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-gray-300">
                          {user.total_simulations}
                        </span>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-medium ${getBNBExpertiseLevel(user.bnb_expertise).color}`}>
                            {user.bnb_expertise}%
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gray-800 ${getBNBExpertiseLevel(user.bnb_expertise).color}`}>
                            {getBNBExpertiseLevel(user.bnb_expertise).label}
                          </span>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <span className="text-purple-400 font-medium">
                          {user.achievements_count}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {leaderboard.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-4">No rankings yet</div>
                  <p className="text-gray-500">Be the first to complete a simulation!</p>
                </div>
              )}
            </div>
          </div>

          {/* BNB Chain Features */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">Fast Transactions</h3>
              <p className="text-gray-400 text-sm">
                BNB Chain's 3-second block time gives your project instant user satisfaction
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-bold text-cyan-400 mb-2">Low Fees</h3>
              <p className="text-gray-400 text-sm">
                Sub-dollar transaction costs make your DApp accessible to everyone
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/40 border border-gray-700/50 rounded-xl p-6 backdrop-blur-sm text-center">
              <div className="text-3xl mb-3">🌟</div>
              <h3 className="text-lg font-bold text-amber-400 mb-2">Rich Ecosystem</h3>
              <p className="text-gray-400 text-sm">
                Leverage established DeFi protocols, NFT markets, and gaming platforms
              </p>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center mt-12">
            <button
              onClick={() => router.push('/simulator')}
              className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-amber-400/25"
            >
              Start Your Simulation
            </button>
            
            {!userAddress && (
              <p className="text-gray-400 text-sm mt-4">
                Connect your wallet to track your progress and compete on the leaderboard
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}