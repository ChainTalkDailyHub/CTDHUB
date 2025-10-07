// API Endpoint for Binno AI Analysis
import { NextApiRequest, NextApiResponse } from 'next'
import { BinnoAI, BINNO_SCENARIOS } from '../../../lib/binno'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { 
      scenarioId, 
      userResponse, 
      stage,
      sessionContext 
    } = req.body

    if (!scenarioId || !userResponse || !stage) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Find scenario
    const scenarios = BINNO_SCENARIOS[stage]
    const scenario = scenarios?.find(s => s.id === scenarioId)
    
    if (!scenario) {
      return res.status(404).json({ error: 'Scenario not found' })
    }

    // Initialize Binno AI
    const binno = new BinnoAI(process.env.OPENAI_API_KEY!)

    // Analyze user response
    const analysis = await binno.analyzeUserResponse(
      scenario,
      userResponse,
      sessionContext || { currentScore: 50, reputation: 50, previousDecisions: [] }
    )

    // Calculate score impact based on analysis
    const scoreImpact = Math.round((analysis.overall_score - 50) * 0.8) // Scale to reasonable impact
    const reputationImpact = Math.round((analysis.overall_score - 50) * 0.6)

    // Generate consequence description
    const consequenceDescription = generateConsequenceDescription(analysis, scenario)

    // Prepare response
    const response = {
      analysis,
      scoreImpact,
      reputationImpact,
      consequenceDescription,
      scenarioComplete: true,
      binnoFeedback: formatBinnoFeedback(analysis)
    }

    res.status(200).json(response)

  } catch (error) {
    console.error('Binno API error:', error)
    res.status(500).json({ 
      error: 'Failed to analyze response',
      fallback: {
        analysis: {
          overall_score: 50,
          strengths_identified: ['Basic response provided'],
          weaknesses_identified: ['Analysis temporarily unavailable'],
          missing_considerations: ['Please try again'],
          risk_assessment: { technical: 50, financial: 50, regulatory: 50, market: 50 },
          bnb_integration_understanding: 50,
          improvement_suggestions: ['Retry for detailed feedback'],
          consequence_prediction: 'Standard outcome'
        },
        scoreImpact: 0,
        reputationImpact: 0,
        consequenceDescription: 'Your response was recorded. Analysis will be available shortly.',
        binnoFeedback: 'I apologize, but I\'m having trouble analyzing your response right now. Please try again!'
      }
    })
  }
}

function generateConsequenceDescription(analysis: any, scenario: any): string {
  const score = analysis.overall_score
  
  if (score >= 80) {
    return `🎯 **EXCELLENT DECISION!** Your strategic approach shows deep Web3 understanding. ${analysis.consequence_prediction}`
  } else if (score >= 60) {
    return `✅ **GOOD APPROACH!** Solid thinking with room for improvement. ${analysis.consequence_prediction}`
  } else if (score >= 40) {
    return `⚠️ **RISKY DECISION!** Your approach has significant vulnerabilities. ${analysis.consequence_prediction}`
  } else {
    return `🚨 **CRITICAL ERROR!** This decision could be catastrophic for your project. ${analysis.consequence_prediction}`
  }
}

function formatBinnoFeedback(analysis: any): string {
  let feedback = "🤖 **Binno's Analysis:**\n\n"
  
  if (analysis.strengths_identified.length > 0) {
    feedback += "**✅ Strengths I noticed:**\n"
    analysis.strengths_identified.forEach((strength: string, index: number) => {
      feedback += `${index + 1}. ${strength}\n`
    })
    feedback += "\n"
  }
  
  if (analysis.weaknesses_identified.length > 0) {
    feedback += "**⚠️ Areas for improvement:**\n"
    analysis.weaknesses_identified.forEach((weakness: string, index: number) => {
      feedback += `${index + 1}. ${weakness}\n`
    })
    feedback += "\n"
  }
  
  if (analysis.improvement_suggestions.length > 0) {
    feedback += "**💡 My suggestions:**\n"
    analysis.improvement_suggestions.forEach((suggestion: string, index: number) => {
      feedback += `${index + 1}. ${suggestion}\n`
    })
  }
  
  return feedback
}