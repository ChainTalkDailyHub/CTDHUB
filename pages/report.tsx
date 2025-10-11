import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import Footer from '../components/Footer'

interface QuestionAnalysis {
  question_number: number
  relevance_assessment?: string
  quality_issues?: string[]
  improvement_needed?: string
}

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
    question_analysis?: QuestionAnalysis[]
    learning_path?: string
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
  
  // Get sessionId from query parameter (support both 'id' and 'sessionId')
  const sessionId = (router.query.id || router.query.sessionId) as string

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 dark:border-yellow-400"></div>
                <span className="ml-4 text-lg text-gray-900 dark:text-white">Loading your report...</span>
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-300">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Report Not Available</h1>
                <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
                <button
                  onClick={() => router.push('/binno-ai')}
                  className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-black transition-colors duration-300">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Assessment Complete!
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                🎉 Congratulations! You have completed the CTD Skill Compass!
              </p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Generated on {formatDate(report.timestamp)}
              </p>
            </div>
            
            {/* Score Display */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg p-6 text-center shadow-lg">
              <div className="text-4xl font-bold mb-2">
                {report.overallScore}/100
              </div>
              <div className="text-xl font-semibold text-white">
                {getScoreLabel(report.overallScore)}
              </div>
              <p className="text-yellow-100 mt-2">
                Your CTD HUB Assessment Score
              </p>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">📊</span>
              Executive Summary
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {report.analysis.executive_summary}
            </p>
          </div>

          {/* Strengths */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">💪</span>
              Key Strengths
            </h2>
            <ul className="space-y-3">
              {report.analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 text-xl mr-3">✓</span>
                  <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Improvement Areas */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">🎯</span>
              Areas for Improvement
            </h2>
            <ul className="space-y-3">
              {report.analysis.improvement_areas.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-yellow-500 text-xl mr-3">⚡</span>
                  <span className="text-gray-700 dark:text-gray-300">{area}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">💡</span>
              Recommendations
            </h2>
            <ul className="space-y-3">
              {report.analysis.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 text-xl mr-3">🔍</span>
                  <span className="text-gray-700 dark:text-gray-300">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Action Plan */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">📋</span>
              Action Plan
            </h2>
            <ol className="space-y-3">
              {report.analysis.action_plan.map((action, index) => (
                <li key={index} className="flex items-start">
                  <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-1">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300">{action}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Risk Assessment */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">⚠️</span>
              Risk Assessment
            </h2>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {report.analysis.risk_assessment}
            </p>
          </div>

          {/* Next Steps */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <span className="text-2xl mr-2">🚀</span>
              Next Steps
            </h2>
            <ul className="space-y-3">
              {report.analysis.next_steps.map((step, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-orange-500 dark:text-orange-400 text-xl mr-3">→</span>
                  <span className="text-gray-700 dark:text-gray-300">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Question-by-Question Analysis */}
          {report.analysis.question_analysis && report.analysis.question_analysis.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-2xl p-8 mb-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <span className="text-2xl mr-2">🔍</span>
                Detailed Question Analysis
              </h2>
              <div className="space-y-6">
                {report.analysis.question_analysis.map((qa, index) => (
                  <div key={index} className="border-l-4 border-orange-500 pl-6 py-4 bg-gray-50 dark:bg-gray-800 rounded-r-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      Question {qa.question_number}
                    </h3>
                    {qa.relevance_assessment && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Assessment:</span>
                        <p className="text-gray-700 dark:text-gray-300 mt-1">{qa.relevance_assessment}</p>
                      </div>
                    )}
                    {qa.quality_issues && qa.quality_issues.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Quality Issues:</span>
                        <ul className="mt-1 space-y-1">
                          {qa.quality_issues.map((issue, issueIndex) => (
                            <li key={issueIndex} className="text-red-600 dark:text-red-400 text-sm flex items-start">
                              <span className="mr-2">•</span>
                              {issue}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {qa.improvement_needed && (
                      <div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Improvement Suggestion:</span>
                        <p className="text-blue-600 dark:text-blue-400 mt-1 text-sm">{qa.improvement_needed}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Path */}
          {report.analysis.learning_path && (
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-8 mb-8 border border-blue-200 dark:border-blue-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                <span className="text-2xl mr-2">🎓</span>
                Recommended Learning Path
              </h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {report.analysis.learning_path}
              </p>
            </div>
          )}

          {/* Report Metadata */}
          <div className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 mb-8 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Details</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-700 dark:text-gray-300">
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
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-6 py-3 rounded-lg transition-all duration-300 mr-4 shadow-lg hover:shadow-xl"
            >
              Take Another Assessment
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="bg-gradient-to-r from-slate-600 to-blue-600 hover:from-slate-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
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