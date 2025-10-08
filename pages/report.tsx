import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface ProfessionalReport {
  reportId: string
  userAddress: string
  sessionId: string
  timestamp: string
  overallScore: number
  analysis: {
    executive_summary: string
    strengths: string[]
    improvement_areas: string[]
    recommendations: string[]
    action_plan: string[]
    risk_assessment: string
    next_steps: string[]
  }
  metadata: {
    totalQuestions: number
    completionTime: string
    analysisVersion: string
  }
}

export default function ReportPage() {
  const router = useRouter()
  const [report, setReport] = useState<ProfessionalReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Get sessionId from query parameter instead of route parameter
  const sessionId = router.query.id as string

  useEffect(() => {
    if (!sessionId) {
      setLoading(false)
      setError('No session ID provided')
      return
    }

    const fetchReport = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/.netlify/functions/analysis-reports?sessionId=${sessionId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Report not found. Please complete the assessment first.')
          } else {
            setError(`Error fetching report: ${response.status}`)
          }
          return
        }
        
        const data = await response.json()
        setReport(data)
        
      } catch (error) {
        console.error('Error fetching report:', error)
        setError('Failed to load report. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchReport()
  }, [sessionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <span className="ml-4 text-lg text-gray-600">Loading your report...</span>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Report Not Available</h1>
                <p className="text-gray-600 mb-6">{error}</p>
                <button
                  onClick={() => router.push('/binno-ai')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Take Assessment
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">No Report Found</h1>
                <p className="text-gray-600 mb-6">Please complete the assessment to generate your report.</p>
                <button
                  onClick={() => router.push('/binno-ai')}
                  className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Take Assessment
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Binno AI - Professional Analysis Report
              </h1>
              <p className="text-gray-600">
                Generated on {formatDate(report.timestamp)}
              </p>
            </div>
            
            {/* Score Display */}
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg p-6 text-center">
              <div className="text-4xl font-bold mb-2">
                {report.overallScore}/100
              </div>
              <div className={`text-xl font-semibold ${getScoreColor(report.overallScore)}`}>
                {getScoreLabel(report.overallScore)}
              </div>
              <p className="text-purple-100 mt-2">
                Your Binno AI Assessment Score
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Executive Summary
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {report.analysis.executive_summary}
            </p>
          </div>

          {/* Strengths */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💪</span>
              Key Strengths
            </h2>
            <ul className="space-y-3">
              {report.analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Areas for Improvement
            </h2>
            <ul className="space-y-3">
              {report.analysis.improvement_areas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 text-xl mr-3">⚡</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Recommendations
            </h2>
            <ul className="space-y-3">
              {report.analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 text-xl mr-3">🔍</span>
                  <span className="text-gray-700">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Plan */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Action Plan
            </h2>
            <ol className="space-y-3">
              {report.analysis.action_plan.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{action}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              Risk Assessment
            </h2>
            <p className="text-gray-700 leading-relaxed">
              {report.analysis.risk_assessment}
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <span className="text-2xl mr-2">🚀</span>
              Next Steps
            </h2>
            <ul className="space-y-3">
              {report.analysis.next_steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-purple-500 text-xl mr-3">→</span>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Report Metadata */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Details</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Questions Completed:</span> {report.metadata.totalQuestions}
              </div>
              <div>
                <span className="font-medium">Completion Time:</span> {report.metadata.completionTime}
              </div>
              <div>
                <span className="font-medium">Analysis Version:</span> {report.metadata.analysisVersion}
              </div>
              <div>
                <span className="font-medium">Session ID:</span> {report.sessionId}
              </div>
              <div>
                <span className="font-medium">Report ID:</span> {report.reportId}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="text-center">
            <button
              onClick={() => router.push('/binno-ai')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors mr-4"
            >
              Take Another Assessment
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              View All Reports
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}