import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/router'
import { createClient } from '@supabase/supabase-js'
import { Language, useTranslations, formatString } from '../../../lib/i18n/translations'
import LanguageSelector from '../../../components/LanguageSelector'
import { apiRequest, getApiInfo } from '../../../lib/apiBase'

// Supabase client with environment validation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

interface Question {
  id: string
  question_text: string
  context: string
  stage: string
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  bnb_relevance: number
  critical_factors: string[]
}

interface UserAnswer {
  question_id: string
  question_text: string
  user_response: string
  timestamp: number
}

interface SkillReport {
  id?: string
  user_id: string
  session_id: string
  answers: UserAnswer[]
  ai_analysis_report: string
  created_at: string
}

const FIRST_QUESTION: Question = {
  id: 'q1_project_intro',
  question_text: "Tell me about your Web3 project. What is the project name, how many tokens do you plan to launch, on which blockchain network (BNB Chain, Ethereum, etc.), and what is the main focus of the project (DeFi, GameFi, NFTs, dApp, productivity tool, etc.)? Also describe the overall vision and the problem your project aims to solve.",
  context: "Initial question to understand the complete context of the user's Web3 project",
  stage: "project_overview",
  difficulty_level: 'beginner',
  bnb_relevance: 90,
  critical_factors: ["project_name", "token_supply", "blockchain_network", "project_category", "problem_solving"]
}

export default function SkillCompassQuestionnaire() {
  const router = useRouter()
  const { sessionId } = router.query
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Estado para controlar hidratação
  const [isClient, setIsClient] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState<Language>('pt')

  // Obter traduções para o idioma atual
  const t = useTranslations(currentLanguage)

  // Core State
  const [currentQuestion, setCurrentQuestion] = useState<Question>(FIRST_QUESTION)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [answers, setAnswers] = useState<UserAnswer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [characterCount, setCharacterCount] = useState(0)
  const [userId, setUserId] = useState<string>('')
  
  // Final States
  const [isCompleted, setIsCompleted] = useState(false)
  const [finalReport, setFinalReport] = useState<string>('')
  const [isGeneratingReport, setIsGeneratingReport] = useState(false)
  const [error, setError] = useState<string>('')

  // Garantir que componente só renderiza no cliente após hidratação
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Carregar idioma preferido do usuário
  useEffect(() => {
    if (!isClient) return
    
    const savedLanguage = localStorage.getItem('ctdhub_preferred_language') as Language
    if (savedLanguage && ['pt', 'en', 'es'].includes(savedLanguage)) {
      setCurrentLanguage(savedLanguage)
    }
  }, [isClient])

  // Salvar idioma quando mudar
  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language)
    if (isClient) {
      localStorage.setItem('ctdhub_preferred_language', language)
    }
  }

  // Load user ID from localStorage or generate
  useEffect(() => {
    if (!isClient) return
    
    const storedUserId = localStorage.getItem('ctdhub_user_id')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('ctdhub_user_id', newUserId)
      setUserId(newUserId)
    }
  }, [isClient])

  // Restore session state on page refresh
  useEffect(() => {
    if (!isClient || !sessionId) return
    
    const sessionKey = `questionnaire_session_${sessionId}`
    const savedSession = localStorage.getItem(sessionKey)
    
    if (savedSession) {
      try {
        const sessionData = JSON.parse(savedSession)
        console.log('🔄 Restoring session from localStorage:', sessionData)
        
        // Restore state
        if (sessionData.answers && sessionData.answers.length > 0) {
          setAnswers(sessionData.answers)
          setQuestionNumber(sessionData.questionNumber || sessionData.answers.length + 1)
        }
        
        if (sessionData.currentQuestion) {
          setCurrentQuestion(sessionData.currentQuestion)
        }
        
        if (sessionData.isCompleted && sessionData.finalReport) {
          setIsCompleted(true)
          setFinalReport(sessionData.finalReport)
          console.log('✅ Session completed - showing final report')
        }
        
      } catch (error) {
        console.error('Error restoring session:', error)
        // Continue with fresh session if restore fails
      }
    }
  }, [isClient, sessionId])

  // Save session state to localStorage
  const saveSessionState = useCallback(() => {
    if (!isClient || !sessionId) return
    
    const sessionKey = `questionnaire_session_${sessionId}`
    const sessionData = {
      answers,
      questionNumber,
      currentQuestion,
      isCompleted,
      finalReport,
      timestamp: Date.now()
    }
    
    try {
      localStorage.setItem(sessionKey, JSON.stringify(sessionData))
      console.log('💾 Session state saved to localStorage')
    } catch (error) {
      console.error('Error saving session state:', error)
    }
  }, [isClient, sessionId, answers, questionNumber, currentQuestion, isCompleted, finalReport])

  // Update character count
  const updateCharacterCount = useCallback(() => {
    setCharacterCount(currentAnswer.length)
  }, [currentAnswer])

  // Export PDF function with detailed analysis
  const exportToPDF = async () => {
    if (!finalReport || answers.length === 0) return

    try {
      console.log('🔄 Generating detailed PDF...')
      
      // Generate improved PDF HTML directly
      const pdfHTML = generateEnhancedPDFHTML(finalReport, answers)
      
      // Create new window for PDF display
      const pdfWindow = window.open('', '_blank', 'width=1000,height=800,scrollbars=yes,resizable=yes')
      if (pdfWindow) {
        pdfWindow.document.write(pdfHTML)
        pdfWindow.document.close()
        
        // Add print button to the PDF window without auto-printing
        pdfWindow.onload = () => {
          // Add a print button to the PDF window
          const printButton = pdfWindow.document.createElement('button')
          printButton.innerHTML = '🖨️ Imprimir PDF'
          printButton.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: linear-gradient(135deg, #FFCC33 0%, #FFA500 100%);
            color: #000;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(255, 204, 51, 0.3);
          `
          printButton.onclick = () => {
            pdfWindow.print()
          }
          pdfWindow.document.body.appendChild(printButton)
        }
        
        // Set window title
        pdfWindow.document.title = 'CTD HUB - Relatório de Análise'
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Erro ao gerar o PDF. Por favor, tente novamente ou entre em contato com o suporte.')
    }
  }

  // Enhanced PDF generation function
  const generateEnhancedPDFHTML = (report: string, userAnswers: any[]) => {
    const currentDate = new Date()
    const dateStr = currentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    const timeStr = currentDate.toLocaleTimeString('en-US')
    
    // Extract project name from first answer
    const projectName = userAnswers[0]?.user_response?.split('.')[0]?.trim() || 'Web3 Project'
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTD Skill Compass - Analysis Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: #1a1a1a;
            padding: 20px;
            min-height: 100vh;
            color: #ffffff;
            line-height: 1.6;
        }

        .pdf-container {
            width: 210mm;
            min-height: 297mm;
            background: #000000;
            margin: 0 auto;
            box-shadow: 0 0 30px rgba(255, 204, 51, 0.4);
            border: 1px solid #333;
            position: relative;
            overflow: hidden;
        }

        /* Header */
        .pdf-header {
            background: linear-gradient(135deg, #FFCC33 0%, #FFA500 100%);
            height: 100px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
            box-shadow: 0 4px 20px rgba(255, 204, 51, 0.3);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .logo-section img {
            height: 70px;
            width: auto;
            object-fit: contain;
            background: transparent;
            filter: drop-shadow(0 2px 8px rgba(0,0,0,0.3));
        }

        .logo-fallback {
            height: 70px;
            width: 200px;
            background: rgba(0,0,0,0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 24px;
            color: #000;
            letter-spacing: 2px;
            border: 3px solid #000;
        }

        .header-info {
            text-align: right;
            color: #000;
        }

        .header-info h1 {
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .header-info p {
            font-size: 14px;
            font-weight: 500;
        }
        
        .pdf-content {
            padding: 40px;
            color: #ffffff;
            min-height: calc(297mm - 200px);
        }
        
        .main-title {
            font-size: 28px;
            font-weight: 700;
            color: #FFCC33;
            margin-bottom: 30px;
            text-align: center;
            text-shadow: 0 0 15px rgba(255, 204, 51, 0.5);
            border-bottom: 2px solid #FFCC33;
            padding-bottom: 15px;
        }

        .assessment-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        .info-card {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 1px solid #444;
            border-radius: 12px;
            padding: 25px;
            border-left: 4px solid #FFCC33;
        }

        .info-card h3 {
            color: #FFCC33;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .info-card p {
            margin-bottom: 8px;
            font-size: 14px;
        }

        .info-card strong {
            color: #8BE9FD;
        }
        
        .analysis-content {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 1px solid #444;
            border-left: 4px solid #8BE9FD;
            padding: 30px;
            margin: 25px 0;
            border-radius: 12px;
            line-height: 1.8;
            font-size: 15px;
        }

        .analysis-content h4 {
            color: #8BE9FD;
            margin-top: 25px;
            margin-bottom: 15px;
            font-size: 18px;
        }

        .questions-section {
            margin-top: 40px;
            page-break-inside: avoid;
        }

        .questions-title {
            font-size: 22px;
            color: #FFCC33;
            margin-bottom: 25px;
            border-bottom: 1px solid #444;
            padding-bottom: 10px;
        }

        .question-item {
            background: #1a1a1a;
            border: 1px solid #333;
            border-radius: 8px;
            margin-bottom: 20px;
            padding: 20px;
        }

        .question-text {
            color: #8BE9FD;
            font-weight: 600;
            margin-bottom: 10px;
            font-size: 14px;
        }

        .answer-text {
            color: #ffffff;
            font-size: 13px;
            line-height: 1.6;
            padding-left: 15px;
            border-left: 2px solid #444;
        }
        
        /* Educational Assessment Section Styles */
        .assessment-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border: 1px solid #444;
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 25px;
            page-break-inside: avoid;
        }
        
        .section-title {
            color: #FFCC33;
            font-size: 20px;
            font-weight: 700;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 2px solid rgba(255, 204, 51, 0.3);
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section-content {
            color: #e2e8f0;
            font-size: 14px;
            line-height: 1.7;
        }
        
        .section-content p {
            margin-bottom: 12px;
        }
        
        .section-content ul {
            margin: 0;
            padding-left: 25px;
        }
        
        .section-content li {
            margin-bottom: 10px;
            line-height: 1.6;
        }
        
        .pdf-footer {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 60px;
            background: linear-gradient(180deg, transparent 0%, #141414 50%, #000000 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 40px;
            font-size: 12px;
            color: #94A3B8;
        }

        .footer-left {
            font-weight: 500;
        }

        .footer-right {
            text-align: right;
        }

        .footer-right .date {
            font-weight: 600;
            color: #FFCC33;
        }

        .footer-right .website {
            color: #8BE9FD;
            font-weight: 600;
            margin-top: 2px;
        }

        @media print {
            body { 
                background: white; 
                margin: 0;
                padding: 0;
            }
            .pdf-container { 
                box-shadow: none; 
                border: none; 
                margin: 0;
                width: 100%;
                min-height: 100vh;
            }
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <!-- Header -->
        <div class="pdf-header">
            <div class="logo-section">
                <img src="/images/CTDHUB.png" alt="CTD HUB Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" style="display:none;">CTD HUB</div>
            </div>
            <div class="header-info">
                <h1>Skill Compass Analysis</h1>
                <p>BINNO AI Assessment Report</p>
            </div>
        </div>

        <!-- Content -->
        <div class="pdf-content">
            <h1 class="main-title">CTD Skill Compass Analysis</h1>

            <!-- Assessment Info -->
            <div class="assessment-info">
                <div class="info-card">
                    <h3>📊 Assessment Details</h3>
                    <p><strong>Project:</strong> ${projectName}</p>
                    <p><strong>Questions Answered:</strong> ${userAnswers.length}</p>
                    <p><strong>Assessment Date:</strong> ${dateStr}</p>
                    <p><strong>Completion Time:</strong> ${timeStr}</p>
                </div>
                <div class="info-card">
                    <h3>🤖 Analysis Engine</h3>
                    <p><strong>AI System:</strong> BINNO AI</p>
                    <p><strong>Model:</strong> GPT-4 Enhanced</p>
                    <p><strong>Analysis Type:</strong> Comprehensive</p>
                    <p><strong>Report Version:</strong> 2.0</p>
                </div>
            </div>
            
            <!-- Educational Assessment Sections -->
            ${(() => {
              // Parse the template-formatted report into structured sections
              const sections: {
                executive: string
                score: string
                strengths: string[]
                improvements: string[]
                recommendations: string[]
                actionPlan: string[]
                riskAssessment: string
                questionAnalysis: string[]
              } = {
                executive: '',
                score: '',
                strengths: [],
                improvements: [],
                recommendations: [],
                actionPlan: [],
                riskAssessment: '',
                questionAnalysis: []
              }
              
              // Extract sections using regex patterns
              const executiveMatch = report.match(/EXECUTIVE_SUMMARY:\s*([\s\S]*?)(?=\n\n[A-Z_]+:|$)/i)
              if (executiveMatch) sections.executive = executiveMatch[1].trim()
              
              const scoreMatch = report.match(/SCORE:\s*(\d+)/i)
              if (scoreMatch) sections.score = scoreMatch[1]
              
              const strengthsMatch = report.match(/STRENGTHS:\s*([\s\S]*?)(?=\n\n[A-Z_]+:|$)/i)
              if (strengthsMatch) {
                sections.strengths = strengthsMatch[1].trim().split('\n').filter(l => l.trim()).map(l => l.replace(/^[-•*]\s*/, ''))
              }
              
              const improvementsMatch = report.match(/IMPROVEMENT_AREAS:\s*([\s\S]*?)(?=\n\n[A-Z_]+:|$)/i)
              if (improvementsMatch) {
                sections.improvements = improvementsMatch[1].trim().split('\n').filter(l => l.trim()).map(l => l.replace(/^[-•*]\s*/, ''))
              }
              
              const recommendationsMatch = report.match(/RECOMMENDATIONS:\s*([\s\S]*?)(?=\n\n[A-Z_]+:|$)/i)
              if (recommendationsMatch) {
                sections.recommendations = recommendationsMatch[1].trim().split('\n').filter(l => l.trim()).map(l => l.replace(/^[-•*]\s*/, ''))
              }
              
              const actionMatch = report.match(/ACTION_PLAN:\s*([\s\S]*?)(?=\n\n[A-Z_]+:|$)/i)
              if (actionMatch) {
                sections.actionPlan = actionMatch[1].trim().split('\n').filter(l => l.trim()).map(l => l.replace(/^[-•*]\s*/, ''))
              }
              
              const riskMatch = report.match(/RISK_ASSESSMENT:\s*([\s\S]*?)(?=\n\n[A-Z_]+:|$)/i)
              if (riskMatch) sections.riskAssessment = riskMatch[1].trim()
              
              const questionMatch = report.match(/QUESTION_ANALYSIS:\s*([\s\S]*?)$/i)
              if (questionMatch) {
                sections.questionAnalysis = questionMatch[1].trim().split(/Q\d+:/i).filter(l => l.trim())
              }
              
              return `
                <!-- Executive Summary -->
                <div class="assessment-section">
                  <h2 class="section-title">📊 Executive Summary</h2>
                  <div class="section-content">
                    <p style="line-height: 1.8; color: #e2e8f0;">${sections.executive}</p>
                    ${sections.score ? `<div style="text-align: center; margin-top: 20px; padding: 15px; background: rgba(255, 204, 51, 0.1); border-radius: 8px; border: 1px solid rgba(255, 204, 51, 0.3);">
                      <div style="font-size: 36px; font-weight: 700; color: #FFCC33;">${sections.score}%</div>
                      <div style="font-size: 12px; color: #94a3b8; margin-top: 5px;">OVERALL READINESS SCORE</div>
                    </div>` : ''}
                  </div>
                </div>
                
                <!-- Strengths -->
                ${sections.strengths.length > 0 ? `
                <div class="assessment-section">
                  <h2 class="section-title">✅ Key Strengths Identified</h2>
                  <div class="section-content">
                    <ul style="list-style: none; padding: 0;">
                      ${sections.strengths.map(item => `
                        <li style="margin-bottom: 12px; padding-left: 25px; position: relative; line-height: 1.6;">
                          <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                          ${item}
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
                ` : ''}
                
                <!-- Improvement Areas -->
                ${sections.improvements.length > 0 ? `
                <div class="assessment-section">
                  <h2 class="section-title">📈 Areas for Development</h2>
                  <div class="section-content">
                    <ul style="list-style: none; padding: 0;">
                      ${sections.improvements.map(item => `
                        <li style="margin-bottom: 12px; padding-left: 25px; position: relative; line-height: 1.6;">
                          <span style="position: absolute; left: 0; color: #f59e0b; font-weight: bold;">→</span>
                          ${item}
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
                ` : ''}
                
                <!-- Recommendations -->
                ${sections.recommendations.length > 0 ? `
                <div class="assessment-section">
                  <h2 class="section-title">💡 Personalized Recommendations</h2>
                  <div class="section-content">
                    <ul style="list-style: none; padding: 0;">
                      ${sections.recommendations.map((item, idx) => `
                        <li style="margin-bottom: 12px; padding-left: 30px; position: relative; line-height: 1.6;">
                          <span style="position: absolute; left: 0; color: #8be9fd; font-weight: bold; background: rgba(139, 233, 253, 0.1); border-radius: 4px; padding: 2px 6px; font-size: 11px;">${idx + 1}</span>
                          ${item}
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                </div>
                ` : ''}
                
                <!-- Action Plan -->
                ${sections.actionPlan.length > 0 ? `
                <div class="assessment-section">
                  <h2 class="section-title">🎯 Immediate Action Plan</h2>
                  <div class="section-content">
                    <ol style="padding-left: 20px; margin: 0;">
                      ${sections.actionPlan.map(item => `
                        <li style="margin-bottom: 12px; line-height: 1.6; color: #e2e8f0;">
                          ${item}
                        </li>
                      `).join('')}
                    </ol>
                  </div>
                </div>
                ` : ''}
                
                <!-- Risk Assessment -->
                ${sections.riskAssessment ? `
                <div class="assessment-section">
                  <h2 class="section-title">⚠️ Risk Assessment & Project Readiness</h2>
                  <div class="section-content">
                    <p style="line-height: 1.8; color: #e2e8f0;">${sections.riskAssessment.replace(/\n\n/g, '</p><p style="line-height: 1.8; color: #e2e8f0; margin-top: 15px;">')}</p>
                  </div>
                </div>
                ` : ''}
                
                <!-- Question-by-Question Analysis -->
                ${sections.questionAnalysis.length > 0 ? `
                <div class="assessment-section" style="page-break-before: always;">
                  <h2 class="section-title">📝 Detailed Question Analysis</h2>
                  <div class="section-content">
                    ${sections.questionAnalysis.map((analysis, idx) => `
                      <div style="margin-bottom: 20px; padding: 15px; background: rgba(0, 0, 0, 0.3); border-left: 3px solid #8be9fd; border-radius: 6px;">
                        <div style="font-weight: 600; color: #8be9fd; margin-bottom: 8px;">Question ${idx + 1}</div>
                        <div style="font-size: 13px; line-height: 1.7; color: #cbd5e1;">${analysis.trim()}</div>
                      </div>
                    `).join('')}
                  </div>
                </div>
                ` : ''}
              `
            })()}

            <!-- Questions and Answers Reference -->
            <div class="questions-section" style="page-break-before: always;">
                <h2 class="questions-title">📋 Complete Q&A Reference</h2>
                <p style="color: #94a3b8; font-size: 13px; margin-bottom: 20px;">Your original responses for reference</p>
                ${userAnswers.map((answer, index) => `
                    <div class="question-item">
                        <div class="question-text">
                            Q${index + 1}: ${answer.question_text}
                        </div>
                        <div class="answer-text">
                            ${answer.user_response.length > 300 ? 
                              answer.user_response.substring(0, 300) + '...' : 
                              answer.user_response}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Footer -->
        <div class="pdf-footer">
            <div class="footer-left">
                Generated by CTD HUB BINNO AI - Comprehensive Web3 Assessment Platform
            </div>
            <div class="footer-right">
                <div class="date">${dateStr}</div>
                <div class="website">ctdhub.io</div>
            </div>
        </div>
    </div>
</body>
</html>`
  }
  const generatePDFHTML = (detailedAnalysis: any, originalReport: string) => {
    const currentDate = new Date()
    const dateStr = currentDate.toLocaleDateString('pt-BR')
    const timeStr = currentDate.toLocaleTimeString('pt-BR')
    
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTD Skill Compass - Relatório Detalhado</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: #1a1a1a;
            padding: 20px;
            min-height: 100vh;
            color: #ffffff;
        }

        .pdf-container {
            width: 210mm;
            min-height: 297mm;
            background: #000000;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(255, 204, 51, 0.3);
            border: 1px solid #333;
            position: relative;
            overflow: hidden;
        }

        /* Header */
        .pdf-header {
            background: linear-gradient(135deg, #FFCC33 0%, #FFA500 100%);
            height: 80px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 40px;
            box-shadow: 0 2px 10px rgba(255, 204, 51, 0.5);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-section img {
            height: 50px;
            width: auto;
            object-fit: contain;
            background: transparent;
        }

        .logo-fallback {
            height: 50px;
            width: 150px;
            background: rgba(0,0,0,0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: #000;
            letter-spacing: 1px;
            border: 2px solid #000;
        }

        /* Content */
        .pdf-content {
            padding: 30px;
            color: #ffffff;
        }

        .main-title {
            font-size: 24px;
            font-weight: 700;
            color: #FFCC33;
            margin-bottom: 20px;
            text-align: center;
            text-shadow: 0 0 10px rgba(255, 204, 51, 0.5);
        }

        .session-info {
            background: rgba(255, 204, 51, 0.1);
            border: 1px solid rgba(255, 204, 51, 0.3);
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 30px;
        }

        .session-info h3 {
            color: #FFCC33;
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .session-info p {
            color: #ffffff;
            font-size: 14px;
            margin-bottom: 8px;
            line-height: 1.4;
        }

        .question-analysis {
            background: rgba(139, 233, 253, 0.05);
            border-left: 4px solid #8BE9FD;
            padding: 25px;
            margin-bottom: 30px;
            border-radius: 0 8px 8px 0;
            break-inside: avoid;
        }

        .question-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .question-number {
            background: #FFCC33;
            color: #000;
            padding: 8px 12px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 14px;
        }

        .question-score {
            color: white;
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: 600;
            font-size: 12px;
        }

        .score-excellent { background: #22c55e; }
        .score-good { background: #f59e0b; }
        .score-needs-improvement { background: #ef4444; }

        .question-text {
            color: #8BE9FD;
            font-weight: 600;
            font-size: 14px;
            margin-bottom: 10px;
            line-height: 1.5;
        }

        .user-response {
            background: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            font-size: 12px;
            line-height: 1.6;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .ai-feedback {
            background: rgba(34, 197, 94, 0.1);
            padding: 15px;
            border-radius: 8px;
            font-size: 12px;
            line-height: 1.6;
            border-left: 3px solid #22c55e;
        }

        .feedback-section {
            margin-bottom: 12px;
        }

        .feedback-section strong {
            color: #FFCC33;
            display: block;
            margin-bottom: 5px;
        }

        .study-suggestions {
            background: rgba(255, 204, 51, 0.1);
            border: 1px solid rgba(255, 204, 51, 0.3);
            border-radius: 8px;
            padding: 25px;
            margin-top: 40px;
        }

        .study-suggestions h2 {
            color: #FFCC33;
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: 600;
        }

        .study-content {
            font-size: 12px;
            line-height: 1.6;
            white-space: pre-line;
        }

        .overall-summary {
            background: rgba(139, 233, 253, 0.1);
            border: 1px solid rgba(139, 233, 253, 0.3);
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 30px;
        }

        .overall-summary h2 {
            color: #8BE9FD;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .performance-metrics {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin-bottom: 20px;
        }

        .metric {
            text-align: center;
            background: rgba(0, 0, 0, 0.3);
            padding: 15px;
            border-radius: 8px;
        }

        .metric-value {
            font-size: 24px;
            font-weight: 700;
            color: #FFCC33;
            margin-bottom: 5px;
        }

        .metric-label {
            font-size: 10px;
            color: #ccc;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        /* Footer */
        .pdf-footer {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(180deg, transparent 0%, #141414 50%, #000000 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
            font-size: 10px;
            color: #94A3B8;
        }

        .footer-left {
            font-weight: 500;
        }

        .footer-right {
            text-align: right;
        }

        .footer-right .website {
            color: #8BE9FD;
            font-weight: 600;
            margin-top: 2px;
        }

        @media print {
            body { background: white; }
            .pdf-container { box-shadow: none; border: none; }
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <!-- Header -->
        <div class="pdf-header">
            <div class="logo-section">
                <img src="/images/CTDHUB.png" alt="CTD HUB Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" style="display:none;">CTD HUB</div>
            </div>
        </div>

        <!-- Content -->
        <div class="pdf-content">
            <h1 class="main-title">CTD Skill Compass - Relatório Detalhado</h1>

            <!-- Session Info -->
            <div class="session-info">
                <h3>📊 Informações da Sessão</h3>
                <p><strong>Sessão ID:</strong> ${sessionId}</p>
                <p><strong>Questões Respondidas:</strong> ${answers.length}</p>
                <p><strong>Tipo de Projeto:</strong> ${detailedAnalysis.projectType}</p>
                <p><strong>Data de Conclusão:</strong> ${dateStr} às ${timeStr}</p>
                <p><strong>Performance Geral:</strong> ${detailedAnalysis.overallInsights?.performance}</p>
            </div>

            <!-- Overall Summary -->
            <div class="overall-summary">
                <h2>🎯 Resumo Geral</h2>
                <div class="performance-metrics">
                    <div class="metric">
                        <div class="metric-value">${detailedAnalysis.overallInsights?.averageScore || 0}</div>
                        <div class="metric-label">Score Médio</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${detailedAnalysis.overallInsights?.strongAreasCount || 0}</div>
                        <div class="metric-label">Áreas Fortes</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${detailedAnalysis.overallInsights?.weakAreasCount || 0}</div>
                        <div class="metric-label">Áreas p/ Melhorar</div>
                    </div>
                    <div class="metric">
                        <div class="metric-value">${answers.length}</div>
                        <div class="metric-label">Total Questões</div>
                    </div>
                </div>
            </div>

            <!-- Individual Question Analysis -->
            ${detailedAnalysis.individualAnalyses?.map((analysis: any, index: number) => {
              const scoreClass = analysis.score >= 80 ? 'score-excellent' : analysis.score >= 60 ? 'score-good' : 'score-needs-improvement'
              return `
                <div class="question-analysis">
                    <div class="question-header">
                        <div class="question-number">Questão ${analysis.questionNumber}</div>
                        <div class="question-score ${scoreClass}">${analysis.score}/100</div>
                    </div>
                    
                    <div class="question-text">
                        ${analysis.question}
                    </div>
                    
                    <div class="user-response">
                        <strong style="color: #8BE9FD; margin-bottom: 8px; display: block;">📝 Sua Resposta:</strong>
                        ${analysis.userResponse}
                    </div>
                    
                    <div class="ai-feedback">
                        <div class="feedback-section">
                            <strong>🤖 Análise AI:</strong>
                            ${analysis.feedback}
                        </div>
                    </div>
                </div>
              `
            }).join('') || ''}

            <!-- Study Suggestions -->
            ${detailedAnalysis.studySuggestions ? `
                <div class="study-suggestions">
                    <h2>📚 Sugestões de Estudo Personalizadas</h2>
                    <div class="study-content">${detailedAnalysis.studySuggestions}</div>
                </div>
            ` : ''}
        </div>

        <!-- Footer -->
        <div class="pdf-footer">
            <div class="footer-left">
                Gerado por CTD HUB BinnoAI - Plataforma de Análise Web3 Avançada
            </div>
            <div class="footer-right">
                <div class="website">ctdhub.io</div>
            </div>
        </div>
    </div>
</body>
</html>`
  }

  // Fallback simple PDF generation
  const generateSimplePDF = () => {
    const reportContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTD Skill Compass - Analysis Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        
        body {
            font-family: 'Inter', sans-serif;
            background: #1a1a1a;
            padding: 20px;
            min-height: 100vh;
        }
        
        .pdf-container {
            width: 210mm;
            min-height: 297mm;
            background: #000000;
            margin: 0 auto;
            box-shadow: 0 0 20px rgba(255, 204, 51, 0.3);
            border: 1px solid #333;
            position: relative;
            overflow: hidden;
        }
        
        .pdf-header {
            background: linear-gradient(135deg, #FFCC33 0%, #FFA500 100%);
            height: 80px;
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0 40px;
            box-shadow: 0 2px 10px rgba(255, 204, 51, 0.5);
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .logo-section img {
            height: 50px;
            width: auto;
            object-fit: contain;
            background: transparent;
        }

        .logo-fallback {
            height: 50px;
            width: 150px;
            background: rgba(0,0,0,0.1);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 18px;
            color: #000;
            letter-spacing: 1px;
            border: 2px solid #000;
        }
        
        .pdf-content {
            padding: 30px;
            color: #ffffff;
            min-height: calc(297mm - 120px);
        }
        
        .main-title {
            font-size: 20px;
            font-weight: 700;
            color: #FFCC33;
            margin-bottom: 15px;
            text-shadow: 0 0 10px rgba(255, 204, 51, 0.5);
        }
        
        .analysis-content {
            background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
            border-left: 4px solid #FFCC33;
            padding: 20px;
            margin: 15px 0;
            border-radius: 0 8px 8px 0;
            line-height: 1.6;
        }
        
        .pdf-footer {
            position: absolute;
            bottom: 0;
            width: 100%;
            height: 40px;
            background: linear-gradient(180deg, transparent 0%, #141414 50%, #000000 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30px;
            font-size: 9px;
            color: #94A3B8;
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <div class="pdf-header">
            <div class="logo-section">
                <img src="/images/CTDHUB.png" alt="CTD HUB Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" style="display:none;">CTD HUB</div>
            </div>
        </div>
        
        <div class="pdf-content">
            <h1 class="main-title">CTD Skill Compass Analysis</h1>
            
            <div class="analysis-content">
                ${finalReport.replace(/\n/g, '<br>')}
            </div>
        </div>
        
        <div class="pdf-footer">
            <div class="footer-left">
                Generated by CTD HUB BinnoAI - AI-Powered Web3 Assessment
            </div>
            <div class="footer-right">
                <div>ctdhub.io</div>
            </div>
        </div>
    </div>
</body>
</html>
    `
    
    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `CTD_Skill_Compass_Simple_Report_${sessionId}.html`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    updateCharacterCount()
  }, [currentAnswer, updateCharacterCount])

  // Generate next question using AI
  const generateNextQuestion = async (nextQuestionNumber: number): Promise<Question> => {
    console.log('🔄 Generating question', nextQuestionNumber, 'with', answers.length, 'previous answers')
    
    // First, check if we can use a fallback question for debugging
    const isDebugMode = process.env.NODE_ENV === 'development'
    
    try {
      const requestData = {
        questionNumber: nextQuestionNumber,
        previousAnswers: answers,
        sessionContext: {
          user_expertise_level: 'intermediate',
          project_focus: answers.length > 0 ? answers[0].user_response.substring(0, 200) : '',
          previous_responses_summary: answers.slice(-3).map(a => a.user_response.substring(0, 100)).join('; ')
        }
      }
      
      console.log('📤 Request data:', JSON.stringify(requestData, null, 2))
      
      // Use local API endpoint when running locally
      const isLocalhost = typeof window !== 'undefined' && window.location.hostname === 'localhost'
      const apiEndpoint = isLocalhost ? '/api/binno/generate-question' : '/.netlify/functions/binno-generate-question'
      
      console.log('🌐 Using API endpoint:', apiEndpoint)
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        signal: AbortSignal.timeout(25000) // 25 second timeout
      })

      console.log('📥 Response status:', response.status)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('❌ Error response:', errorData)
        throw new Error(errorData.error || `AI Question Generation failed: ${response.status}`)
      }

      // Try to parse JSON with better error handling
      let data
      try {
        const responseText = await response.text()
        console.log('🔍 Raw response length:', responseText.length)
        console.log('🔍 Raw response preview:', responseText.substring(0, 200) + '...')
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error('❌ JSON Parse Error:', parseError)
        console.error('🔍 Response was not valid JSON, using fallback')
        throw new Error('Invalid JSON response from API - will use fallback question')
      }
      
      if (!data.question || !data.question.question_text) {
        throw new Error('Invalid question structure received from API')
      }
      
      console.log('✅ Question generated successfully:', data.question.question_text.substring(0, 50) + '...')
      return data.question
      
    } catch (error) {
      console.error('💥 AI Question Generation Failed:', error)
      
      // Enhanced error logging
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('🌐 Network error - check connection')
      } else if (error instanceof SyntaxError && error.message.includes('JSON')) {
        console.error('🔍 JSON Parse Error - Response was not valid JSON')
      } else if (error instanceof Error && error.name === 'AbortError') {
        console.error('⏰ Request timeout - API took too long to respond')
      }
      
      // Generate enhanced fallback question based on question number
      const fallbackQuestions = {
        2: "Describe the technical architecture of your Web3 project. What smart contracts will you need? What programming languages and frameworks are you planning to use? Include details about scalability, security considerations, and integration with existing blockchain infrastructure.",
        3: "Explain your project's tokenomics model in detail. How will tokens be distributed? What utility does your token provide to users? What mechanisms will you implement to maintain token value and prevent inflation? How does your economic model incentivize user participation?",
        4: "What is your go-to-market strategy? Who is your target audience and how will you reach them? What partnerships are you considering? How will you handle user acquisition and retention? What marketing channels will be most effective for your project?",
        5: "How will you handle governance and community building? What voting mechanisms will you implement? How will community members participate in decision-making? What incentives will you provide for active community participation?",
        6: "What are the main risks and challenges you anticipate for your project? How will you mitigate technical risks, regulatory challenges, and market volatility? What contingency plans do you have in place?",
        7: "Describe your team's background and expertise. What roles need to be filled? How will you attract and retain top talent? What advisors or mentors are you working with? What is your hiring strategy?",
        8: "What is your development timeline and roadmap? What are the key milestones for the next 6-12 months? How will you prioritize features and improvements? What dependencies might affect your timeline?",
        9: "How will you measure success and track key performance indicators? What metrics are most important for your project? How will you gather user feedback and iterate based on data?",
        10: "What is your funding strategy? How much capital do you need and for what purposes? Are you considering traditional VCs, token sales, grants, or other funding mechanisms? What is your burn rate and runway?",
        11: "How does your project contribute to the broader Web3 ecosystem? What partnerships with other protocols are you considering? How will you integrate with existing DeFi, GameFi, or other Web3 infrastructure?",
        12: "What is your user onboarding strategy? How will you make your product accessible to both crypto-native and traditional users? What educational resources will you provide? How will you handle user support?",
        13: "Describe your approach to security and auditing. What security measures are you implementing? Which audit firms are you considering? How will you handle potential vulnerabilities or exploits?",
        14: "What is your long-term vision for the project? Where do you see it in 3-5 years? How will you maintain innovation and competitiveness? What new features or expansions are you considering?",
        15: "Looking back at your responses, what do you think are the strongest and weakest aspects of your project plan? What would you prioritize if you had to focus on just three key areas? What advice would you give to other Web3 entrepreneurs?"
      }
      
      const fallbackQuestion: Question = {
        id: `q${nextQuestionNumber}_fallback_${Date.now()}`,
        question_text: fallbackQuestions[nextQuestionNumber as keyof typeof fallbackQuestions] || `Question ${nextQuestionNumber}: Please describe your approach to the next phase of your Web3 project development, including any technical, business, or strategic considerations that you think are important to address.`,
        context: `Fallback question ${nextQuestionNumber} for Web3 project assessment (API unavailable)`,
        stage: nextQuestionNumber <= 3 ? 'project_overview' : nextQuestionNumber <= 6 ? 'technical_assessment' : nextQuestionNumber <= 9 ? 'business_strategy' : nextQuestionNumber <= 12 ? 'implementation_planning' : 'final_evaluation',
        difficulty_level: (nextQuestionNumber <= 4 ? 'beginner' : nextQuestionNumber <= 8 ? 'intermediate' : nextQuestionNumber <= 12 ? 'advanced' : 'expert') as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        bnb_relevance: 80,
        critical_factors: ['project_planning', 'technical_understanding', 'business_strategy']
      }
      
      console.log('🔄 Using enhanced fallback question due to API error')
      console.log('📝 Fallback question:', fallbackQuestion.question_text.substring(0, 100) + '...')
      
      return fallbackQuestion
    }
  }

  // Submit answer and get next question
  const handleSubmitAnswer = async () => {
    // Validation with better error messages
    if (!currentAnswer.trim()) {
      setError('Por favor, forneça uma resposta antes de continuar.')
      return
    }

    if (currentAnswer.length < 10) {
      setError(`Resposta muito curta. Por favor, forneça pelo menos 10 caracteres. (Atual: ${currentAnswer.length})`)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      console.log(`📝 Submitting answer for question ${questionNumber}`)
      console.log(`📊 Answer length: ${currentAnswer.length} characters`)
      
      // Clear any previous errors
      setError('')
      
      // Add current answer to answers array
      const newAnswer: UserAnswer = {
        question_id: currentQuestion.id,
        question_text: currentQuestion.question_text,
        user_response: currentAnswer.trim(),
        timestamp: Date.now()
      }

      const updatedAnswers = [...answers, newAnswer]
      setAnswers(updatedAnswers)

      // Check if questionnaire is complete (15 questions)
      if (questionNumber >= 15) {
        console.log('🎯 Questionnaire complete, generating final report...')
        try {
          await generateFinalReport(updatedAnswers)
        } catch (reportError) {
          console.error('Error generating final report:', reportError)
          setError('Falha ao gerar relatório final. Por favor, tente novamente.')
        }
        return
      }

      // Generate next question
      console.log(`🔄 Generating question ${questionNumber + 1}...`)
      setIsGeneratingQuestion(true)
      const nextQuestionNumber = questionNumber + 1
      
      try {
        const nextQuestion = await generateNextQuestion(nextQuestionNumber)
        
        setCurrentQuestion(nextQuestion)
        setQuestionNumber(nextQuestionNumber)
        setCurrentAnswer('')
        
        // Save session state after successful question generation
        setTimeout(() => {
          saveSessionState()
          textareaRef.current?.focus()
        }, 100)
        
        console.log(`✅ Successfully generated question ${nextQuestionNumber}`)
      } catch (questionError) {
        console.error('Error generating next question:', questionError)
        setError(`Falha ao gerar questão ${nextQuestionNumber}. Erro: ${questionError instanceof Error ? questionError.message : 'Erro desconhecido'}. Por favor, recarregue a página e tente novamente.`)
        // Revert state if question generation fails
        setAnswers(answers) // Keep previous state
      }

    } catch (error) {
      console.error('Error submitting answer:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
      setError(`Falha ao processar sua resposta: ${errorMessage}. Verifique sua conexão e tente novamente.`)
    } finally {
      setIsSubmitting(false)
      setIsGeneratingQuestion(false)
    }
  }

  // Generate final AI analysis report
  const generateFinalReport = async (finalAnswers: UserAnswer[]) => {
    setIsGeneratingReport(true)
    setError('')

    try {
      console.log('🚀 Starting final analysis with API info:', getApiInfo())
      
      const data = await apiRequest('binno-final-analysis', {
        method: 'POST',
        body: JSON.stringify({
          sessionId: sessionId,
          userAnswers: finalAnswers,
          language: currentLanguage
        })
      })
      
      if (data.success && data.analysis) {
        console.log(`✅ Analysis generated successfully with score: ${data.score}%`)
        console.log(`💾 Saved to database: ${data.saved ? 'Yes' : 'No'}`)
        
        // Display analysis inline in current page
        setFinalReport(data.analysis)
        setIsCompleted(true)
        
        // Save session ID for future reference
        const sessionIdStr = Array.isArray(sessionId) ? sessionId[0] : sessionId || 'unknown'
        localStorage.setItem('ctdhub:last-assessment', sessionIdStr)
        localStorage.setItem('ctdhub:last-score', data.score.toString())
        
        // Save completed session state
        saveSessionState()
        
        console.log('Assessment completed and saved')
      } else {
        throw new Error(data.error || 'Failed to generate analysis')
      }

    } catch (error) {
      console.error('Error generating final report:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate final report. Please try again.')
    } finally {
      setIsGeneratingReport(false)
    }
  }

  // Save report to Supabase (optional, non-blocking)
  const saveReportToSupabase = async (finalAnswers: UserAnswer[], analysis: string) => {
    try {
      // Check if Supabase is configured
      if (!supabase) {
        console.log('Supabase not configured - skipping database save')
        return
      }

      // Only attempt to save if we have a valid session and user ID
      if (!sessionId || !userId) {
        console.log('Skipping Supabase save - missing session or user ID')
        return
      }

      const reportData: Omit<SkillReport, 'id'> = {
        user_id: userId,
        session_id: sessionId as string,
        answers: finalAnswers,
        ai_analysis_report: analysis,
        created_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('skill_compass_reports')
        .insert([reportData])

      if (error) {
        console.error('Supabase save error:', error)
        throw new Error(`Database save failed: ${error.message}`)
      } else {
        console.log('Report saved to Supabase successfully')
      }
    } catch (error) {
      console.error('Error in saveReportToSupabase:', error)
      throw error
    }
  }

  // Handle key press for Enter to submit
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !isSubmitting && !isGeneratingQuestion) {
      handleSubmitAnswer()
    }
  }

  // Navigation functions
  const handlePrevious = () => {
    if (questionNumber > 1 && answers.length > 0) {
      try {
        const previousAnswer = answers[answers.length - 1]
        setCurrentAnswer(previousAnswer.user_response)
        setQuestionNumber(prev => prev - 1)
        setAnswers(prev => prev.slice(0, -1))
        
        // Reconstruct previous question (simplified)
        setCurrentQuestion({
          id: previousAnswer.question_id,
          question_text: previousAnswer.question_text,
          context: 'Previous question',
          stage: 'review',
          difficulty_level: 'intermediate',
          bnb_relevance: 70,
          critical_factors: []
        })
        
        // Clear any errors
        setError('')
      } catch (error) {
        console.error('Error in handlePrevious:', error)
        setError('Error navigating to previous question')
      }
    }
  }

  // Aguardar hidratação antes de renderizar conteúdo que depende do cliente
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 py-8 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-lg">Loading...</div>
      </div>
    )
  }

  if (isCompleted && finalReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-300 dark:border-gray-600 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center mx-auto mb-6">
                <img 
                  src="/images/CTDHUB.png" 
                  alt="CTDHUB Logo" 
                  className="w-32 h-32 object-contain"
                />
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Assessment Complete!
              </h1>
              
              {/* Congratulations Message */}
              <div className="bg-gradient-to-r from-ctd-yellow/10 to-ctd-holo/10 border border-ctd-yellow/30 rounded-xl p-6 mb-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-ctd-yellow mb-2">🎉 Congratulations!</h2>
                  <p className="text-gray-900 dark:text-white text-lg mb-2">
                    You have completed the <strong>CTD Skill Compass</strong>!
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Few make it this far. You have demonstrated dedication in evaluating your Web3 skills. 
                    This is an important step in your professional growth journey.
                  </p>
                </div>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 text-lg">
                Based on your {answers.length} detailed responses
              </p>
              <div className="mt-4 px-4 py-2 bg-ctd-yellow/20 rounded-lg inline-block">
                <span className="text-ctd-yellow font-semibold">✅ Report Generated Successfully</span>
              </div>
            </div>

            {/* Report Content - Enhanced Layout */}
            <div className="space-y-6">
              {/* Analysis Header */}
              <div className="bg-gradient-to-r from-ctd-bg to-ctd-panel rounded-2xl p-6 border border-gray-300 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="bg-ctd-yellow/20 p-3 rounded-lg mr-4">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your CTD Skill Compass Analysis</h2>
                    <p className="text-gray-600 dark:text-gray-300">BINNO AI-Powered Web3 Assessment Results</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300/50 rounded-lg p-4 text-center border border-gray-300 dark:border-gray-600/50">
                    <div className="text-ctd-yellow font-bold text-lg">{answers.length}</div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">Questions Answered</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300/50 rounded-lg p-4 text-center border border-gray-300 dark:border-gray-600/50">
                    <div className="text-ctd-holo font-bold text-lg">BINNO AI</div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">Personalized Analysis</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300/50 rounded-lg p-4 text-center border border-gray-300 dark:border-gray-600/50">
                    <div className="text-ctd-yellow font-bold text-lg">{new Date().toLocaleDateString()}</div>
                    <div className="text-gray-600 dark:text-gray-300 text-sm">Assessment Date</div>
                  </div>
                </div>
              </div>

              {/* Main Analysis Content */}
              <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 rounded-2xl border border-gray-300 dark:border-gray-600 overflow-hidden">
                <div className="bg-gradient-to-r from-ctd-yellow/10 to-ctd-holo/10 p-4 border-b border-gray-300 dark:border-gray-600">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                    <span className="mr-2">🤖</span>
                    BINNO AI Assessment Report
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                    Comprehensive analysis powered by BINNO AI, tailored to your responses
                  </p>
                </div>
                
                <div className="p-6">
                  <div className="prose prose-lg max-w-none text-gray-900 dark:text-white leading-relaxed">
                    <div 
                      className="ai-analysis-content"
                      dangerouslySetInnerHTML={{ __html: finalReport.replace(/\n/g, '<br />') }} 
                    />
                  </div>
                </div>
              </div>

              {/* Next Steps Section */}
              <div className="bg-gradient-to-br from-ctd-panel via-ctd-bg to-ctd-panel rounded-2xl p-6 border border-gray-300 dark:border-gray-600">
                <div className="flex items-center mb-4">
                  <div className="bg-ctd-holo/20 p-3 rounded-lg mr-4">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Next Steps in Your Journey</h3>
                    <p className="text-gray-600 dark:text-gray-300">Continue your Web3 development path</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300/30 rounded-lg p-4 border border-gray-300 dark:border-gray-600/30">
                    <div className="flex items-center mb-2">
                      <span className="mr-2">📚</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Explore Learning Paths</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Discover curated courses and resources based on your assessment
                    </p>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300/30 rounded-lg p-4 border border-gray-300 dark:border-gray-600/30">
                    <div className="flex items-center mb-2">
                      <span className="mr-2">🔄</span>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Retake Assessment</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">
                      Track your progress by taking the assessment again later
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => router.push('/questionnaire')}
                className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark transition-colors font-medium"
              >
                🔄 Take Another Assessment
              </button>
              <button
                onClick={() => router.push('/binno-ai')}
                className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-ctd-border/30 transition-colors font-medium"
              >
                💬 Chat with Binno AI
              </button>
              <button
                onClick={() => router.push('/courses')}
                className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-ctd-border/30 transition-colors font-medium"
              >
                📚 Explore Courses
              </button>
              <button
                onClick={exportToPDF}
                className="px-6 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-lg hover:bg-ctd-border/30 transition-colors font-medium"
              >
                � Export PDF
              </button>
            </div>

            {/* Footer Info */}
            <div className="mt-8 pt-6 border-t border-gray-300 dark:border-gray-600 text-center">
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                💾 Your assessment has been saved. Session ID: {sessionId}
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-xs mt-2">
                ⏰ Completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-300 dark:border-gray-600">
          {/* Header */}
          <div className="p-8 border-b border-gray-300 dark:border-gray-600">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t.skillCompass}
              </h1>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {formatString(t.questionOf, { current: questionNumber.toString(), total: '15' })}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 shadow-inner">
              <div 
                className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 h-3 rounded-full transition-all duration-500 shadow-lg relative overflow-hidden"
                style={{ width: `${(questionNumber / 15) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
              </div>
            </div>
          </div>

          {/* Language Selector */}
          <div className="px-8 pt-4">
            <div className="flex justify-end">
              <LanguageSelector 
                currentLanguage={currentLanguage}
                onLanguageChange={handleLanguageChange}
              />
            </div>
          </div>

          {/* Question Section */}
          <div className="p-8">
            {isGeneratingQuestion ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ctd-yellow mx-auto mb-4"></div>
                <p className="text-gray-900 dark:text-white text-lg">
                  {t.generatingQuestion}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {t.generatingQuestionDesc}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    {currentQuestion.question_text}
                  </h2>
                  {currentQuestion.context && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-xl border-l-4 border-yellow-400 shadow-sm">
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">💡</span>
                        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                          {currentQuestion.context}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <textarea
                    ref={textareaRef}
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="💭 Share your thoughts, strategies, and insights here..."
                    className="w-full h-40 p-5 bg-white dark:bg-gray-900 border-2 border-gray-300 dark:border-gray-600 rounded-xl focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400 resize-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 shadow-sm hover:shadow-md"
                    disabled={isSubmitting}
                  />
                  
                  <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
                    <span>{characterCount} characters</span>
                    <span>Ctrl+Enter to submit</span>
                  </div>
                </div>

                {error && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg text-red-400">
                    {error}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="p-8 border-t border-gray-300 dark:border-gray-600 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={questionNumber <= 1 || isSubmitting || isGeneratingQuestion}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white hover:bg-ctd-border/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {t.previousButton}
            </button>

            <div className="flex space-x-4">
              {isGeneratingReport ? (
                <div className="flex items-center px-6 py-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-ctd-yellow mr-2"></div>
                  <span className="text-ctd-yellow font-medium">{t.generatingReport}</span>
                </div>
              ) : (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={!currentAnswer.trim() || currentAnswer.length < 10 || isSubmitting || isGeneratingQuestion}
                  className="px-6 py-3 bg-ctd-yellow text-black rounded-lg hover:bg-ctd-yellow-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      {t.processing}
                    </span>
                  ) : questionNumber >= 15 ? (
                    t.completeAssessment  // ← "Complete Assessment"
                  ) : (
                    t.nextQuestion        // ← "Next Question →"
                  )}
                </button>
              )}
            </div>
          </div>

          {/* AI Status Indicator */}
          <div className="px-8 pb-4">
            <div className="text-xs text-center text-gray-600 dark:text-gray-300 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 rounded-lg p-2 border border-gray-300 dark:border-gray-600">
              {t.poweredByBinno}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}