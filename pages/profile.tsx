import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface UserReport {
  id: string
  session_id: string
  score: number
  created_at: string
  report_data: {
    reportId: string
    overallScore: number
    analysis: {
      executive_summary: string
    }
    metadata: {
      totalQuestions: number
    }
  }
}

export default function UserProfile() {
  const router = useRouter()
  const [reports, setReports] = useState<UserReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [userAddress, setUserAddress] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem('ctdhub:wallet')
    if (stored) {
      setIsConnected(true)
      setUserAddress(stored)
      loadUserReports(stored)
    } else {
      setIsLoading(false)
    }
  }, [])

  const loadUserReports = async (address: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/.netlify/functions/analysis-reports?userAddress=${address}`)
      
      if (response.ok) {
        const reportsData = await response.json()
        setReports(reportsData)
      }
    } catch (error) {
      console.error('Error loading reports:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800'
    if (score >= 60) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-800">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
            <p className="text-gray-400 mb-6">Please connect your wallet to view your analysis reports</p>
            <button
              onClick={() => router.push('/')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-800">
      <Header />
      
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Analysis Reports</h1>
          <p className="text-gray-400">
            Your project analysis history and professional reports
          </p>
          <div className="mt-4 p-4 bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-300">
              <strong>Wallet:</strong> {userAddress.slice(0, 8)}...{userAddress.slice(-6)}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
              <p className="text-white">Loading your reports...</p>
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Reports Yet</h3>
            <p className="text-gray-400 mb-6">
              Take your first project analysis to get professional insights
            </p>
            <button
              onClick={() => router.push('/binno-ai')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Take Analysis
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reports.map((report) => (
              <div key={report.id} className="bg-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-4">
                      <h3 className="text-xl font-bold text-white">
                        Project Analysis Report
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(report.report_data.overallScore)}`}>
                        {report.report_data.overallScore}% Score
                      </div>
                    </div>
                    
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {report.report_data.analysis.executive_summary.slice(0, 200)}...
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <span>📅 {formatDate(report.created_at)}</span>
                      <span>❓ {report.report_data.metadata.totalQuestions} Questions</span>
                      <span>🎯 Session: {report.session_id.slice(0, 8)}...</span>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col items-end gap-3">
                    <div className="text-right">
                      <div className={`text-3xl font-bold ${getScoreColor(report.report_data.overallScore)}`}>
                        {report.report_data.overallScore}%
                      </div>
                      <div className="text-sm text-gray-400">Overall Score</div>
                    </div>
                    
                    <button
                      onClick={() => router.push(`/report?id=${report.session_id}`)}
                      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Take New Analysis Button */}
            <div className="text-center py-8">
              <button
                onClick={() => router.push('/binno-ai')}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Take New Analysis
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}