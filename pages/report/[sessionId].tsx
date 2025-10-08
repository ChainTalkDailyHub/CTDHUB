import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import Footer from '../../components/Footer'

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

export default function ProfessionalReportPage() {
  const router = useRouter()
  const { sessionId } = router.query
  const [report, setReport] = useState<ProfessionalReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      loadReport(sessionId as string)
    }
  }, [sessionId])

  const loadReport = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      
      console.log('🔍 Loading report for session:', id)
      
      // Try to load from database first
      const response = await fetch(`/.netlify/functions/analysis-reports?sessionId=${id}`)
      
      if (response.ok) {
        const reportData = await response.json()
        console.log('✅ Report loaded from database')
        setReport(reportData.report_data)
        return
      }
      
      // If not found in database, try a direct regeneration attempt
      console.log('⚠️ Report not found in database, trying alternate lookup...')
      
      // Wait a moment and try again (sometimes there's a timing issue)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const retryResponse = await fetch(`/.netlify/functions/analysis-reports?sessionId=${id}`)
      if (retryResponse.ok) {
        const retryData = await retryResponse.json()
        console.log('✅ Report found on retry')
        setReport(retryData.report_data)
        return
      }
      
      throw new Error('Report not found after retry')
      
    } catch (error) {
      console.error('Error loading report:', error)
      setError('Failed to load report')
    } finally {
      setIsLoading(false)
    }
  }

  const downloadPDF = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-800">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-white">Loading report...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-800">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Report Not Found</h2>
            <p className="text-gray-400 mb-6">{error || 'The requested report could not be found.'}</p>
            <button
              onClick={() => router.push('/profile')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors"
            >
              View All Reports
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
      
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 print:shadow-none">
          {/* Logo and Header */}
          <div className="flex items-center justify-between mb-6 border-b pb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center overflow-hidden">
                <img src="/images/CTDHUB.png" alt="CTDHUB Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CTD Skill Compass</h1>
                <p className="text-gray-600">Professional Web3 Assessment Report</p>
              </div>
            </div>
            <div className="text-right text-sm text-gray-500">
              <p>Report ID: {report.reportId}</p>
              <p>Generated: {new Date(report.timestamp).toLocaleDateString()}</p>
              <p>Version: {report.metadata.analysisVersion}</p>
            </div>
          </div>

          {/* Score Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Overall Assessment</h2>
                <p className="text-gray-600">Based on {report.metadata.totalQuestions} comprehensive questions</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-indigo-600 mb-1">{report.overallScore}%</div>
                <div className="text-sm text-gray-500">Project Readiness Score</div>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-3">
            <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Executive Summary
          </h2>
          <p className="text-gray-700 leading-relaxed text-lg">
            {report.analysis.executive_summary}
          </p>
        </div>

        {/* Strengths */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Key Strengths
          </h2>
          <div className="space-y-4">
            {report.analysis.strengths.map((strength, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold">✓</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{strength}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Areas */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Areas for Improvement
          </h2>
          <div className="space-y-4">
            {report.analysis.improvement_areas.map((area, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold">!</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{area}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
            Strategic Recommendations
          </h2>
          <div className="space-y-4">
            {report.analysis.recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{recommendation}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Plan */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</span>
            Implementation Action Plan
          </h2>
          <div className="space-y-4">
            {report.analysis.action_plan.map((action, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold">{index + 1}</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">6</span>
            Risk Assessment
          </h2>
          <p className="text-gray-700 leading-relaxed">{report.analysis.risk_assessment}</p>
        </div>

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8 print:shadow-none">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-8 h-8 bg-yellow-500 text-white rounded-full flex items-center justify-center text-sm font-bold">7</span>
            Immediate Next Steps
          </h2>
          <div className="space-y-4">
            {report.analysis.next_steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="w-6 h-6 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-sm font-bold">→</span>
                </div>
                <p className="text-gray-700 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 rounded-lg p-6 text-center print:shadow-none">
          <p className="text-gray-600 mb-4">
            This report was generated by CTDHUB AI analysis system on {new Date(report.timestamp).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Visit <strong>ctdhub.netlify.app</strong> for more Web3 development resources and updates to your project analysis
          </p>
          
          {/* Action Buttons */}
          <div className="flex gap-4 justify-center print:hidden">
            <button
              onClick={downloadPDF}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Download PDF
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              View All Reports
            </button>
            <button
              onClick={() => router.push('/binno-ai')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Take New Assessment
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}