const { createClient } = require('@supabase/supabase-js')const { createClient } = require('@supabase/supabase-js')const { createClient } = require('@supabase/supabase-js')const { createClient } = require('@supabase/supabase-js')import type { Handler } from '@netlify/functions'



const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

function calculateScore(userAnswers) {

  if (!userAnswers || userAnswers.length === 0) return 0const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'import { BinnoAI, UserAnswer } from '../../lib/binno-questionnaire'

  

  let totalScore = 0const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  for (const answer of userAnswers) {

    if (answer.user_response && answer.user_response.trim().length > 0) {const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'

      const responseLength = answer.user_response.trim().length

      const contentQuality = Math.min(10, responseLength / 20)function calculateScore(userAnswers) {

      totalScore += contentQuality

    }  if (!userAnswers || userAnswers.length === 0) return 0const SUPABASE_URL = 'https://srqgmflodlowmybgxxeu.supabase.co'

  }

    

  return Math.round((totalScore / (userAnswers.length * 10)) * 100)

}  let totalScore = 0const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)



function generateAnalysis(userAnswers, score) {  for (const answer of userAnswers) {

  return {

    reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,    if (answer.user_response && answer.user_response.trim().length > 0) {const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNycWdtZmxvZGxvd215Ymd4eGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMDM2MjgsImV4cCI6MjA3NDU3OTYyOH0.yI4PQXcmd96JVMoG46gh85G3hFVr0L3L7jBHWlJzAlQ'// Use environment variable for OpenAI API Key

    userAddress: '',

    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,      const responseLength = answer.user_response.trim().length

    timestamp: new Date().toISOString(),

    overallScore: score,      const contentQuality = Math.min(10, responseLength / 20)// Simple scoring function

    analysis: {

      executive_summary: `Based on your comprehensive ${userAnswers.length}-question assessment, you demonstrate strong engagement with Web3 and blockchain technologies. Your Binno AI assessment score of ${score}% reflects your current knowledge level and provides insights for your professional development journey.`,      totalScore += contentQuality

      strengths: [

        "Active learning approach to Web3 technologies",    }function calculateScore(userAnswers) {const OPENAI_API_KEY = process.env.OPENAI_API_KEY

        "Demonstrated interest in blockchain innovation",

        "Commitment to professional development in DeFi",  }

        "Understanding of decentralized technology concepts"

      ],    if (!userAnswers || userAnswers.length === 0) return 0

      improvement_areas: [

        "Expand hands-on experience with smart contracts",  return Math.round((totalScore / (userAnswers.length * 10)) * 100)

        "Deepen understanding of DeFi protocols and mechanics", 

        "Strengthen knowledge of blockchain security practices",}  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

        "Develop practical skills in Web3 development tools"

      ],

      recommendations: [

        "Focus on practical projects using testnet environments",function generateAnalysis(userAnswers, score) {  let totalScore = 0

        "Join Web3 communities for networking and collaborative learning",

        "Complete specialized courses in your areas of interest",  const analysisData = {

        "Build a portfolio of blockchain projects to showcase skills"

      ],    reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,  for (const answer of userAnswers) {export const handler: Handler = async (event, context) => {

      action_plan: [

        "Set up development environment for smart contract testing",    userAddress: '',

        "Complete foundational courses in blockchain development",

        "Participate in Web3 hackathons and community events",    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,    if (answer.user_response && answer.user_response.trim().length > 0) {

        "Create and deploy your first DeFi application",

        "Establish connections with other Web3 professionals"    timestamp: new Date().toISOString(),

      ],

      risk_assessment: `Based on your responses, you show a ${score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'developing'} foundation for success in Web3. Continue building technical skills while maintaining focus on practical application and industry networking.`,    overallScore: score,      const responseLength = answer.user_response.trim().length// Simple scoring function  console.log('Skill Compass Final Analysis Generator - Start')

      next_steps: [

        "Continue with CTD Skill Compass learning modules",    analysis: {

        "Apply knowledge through hands-on blockchain projects",

        "Connect with Web3 professionals and mentors",      executive_summary: `Based on your comprehensive ${userAnswers.length}-question assessment, you demonstrate strong engagement with Web3 and blockchain technologies. Your Binno AI assessment score of ${score}% reflects your current knowledge level and provides insights for your professional development journey.`,      const contentQuality = Math.min(10, responseLength / 20)

        "Stay updated with latest DeFi and blockchain trends",

        "Consider advanced certifications in your chosen specialization"      strengths: [

      ]

    },        "Active learning approach to Web3 technologies",      totalScore += contentQualityfunction calculateScore(userAnswers) {  

    metadata: {

      totalQuestions: userAnswers.length,        "Demonstrated interest in blockchain innovation",

      completionTime: 'Assessment completed',

      analysisVersion: 'Binno AI v2.0'        "Commitment to professional development in DeFi",    }

    }

  }        "Understanding of decentralized technology concepts"

}

      ],  }  if (!userAnswers || userAnswers.length === 0) return 0  // Set CORS headers

exports.handler = async (event, context) => {

  const headers = {      improvement_areas: [

    'Access-Control-Allow-Origin': '*',

    'Access-Control-Allow-Headers': 'Content-Type',        "Expand hands-on experience with smart contracts",  

    'Access-Control-Allow-Methods': 'POST, OPTIONS',

    'Content-Type': 'application/json',        "Deepen understanding of DeFi protocols and mechanics", 

  }

        "Strengthen knowledge of blockchain security practices",  return Math.round((totalScore / (userAnswers.length * 10)) * 100)    const headers = {

  if (event.httpMethod === 'OPTIONS') {

    return { statusCode: 200, headers, body: '' }        "Develop practical skills in Web3 development tools"

  }

      ],}

  if (event.httpMethod !== 'POST') {

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }      recommendations: [

  }

        "Focus on practical projects using testnet environments",  let totalScore = 0    'Access-Control-Allow-Origin': '*',

  try {

    console.log('🚀 Binno AI Final Analysis - Starting...')        "Join Web3 communities for networking and collaborative learning",

    

    const { userAnswers, sessionContext, userAddress } = JSON.parse(event.body || '{}')        "Complete specialized courses in your areas of interest",// Generate professional analysis



    if (!userAnswers || userAnswers.length === 0) {        "Build a portfolio of blockchain projects to showcase skills"

      return {

        statusCode: 400,      ],function generateAnalysis(userAnswers, score) {  for (const answer of userAnswers) {    'Access-Control-Allow-Headers': 'Content-Type',

        headers,

        body: JSON.stringify({ error: 'No user answers provided' })      action_plan: [

      }

    }        "Set up development environment for smart contract testing",  const analysisData = {



    console.log(`📊 Processing ${userAnswers.length} answers...`)        "Complete foundational courses in blockchain development",



    const score = calculateScore(userAnswers)        "Participate in Web3 hackathons and community events",    reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,    if (answer.user_response && answer.user_response.trim().length > 0) {    'Access-Control-Allow-Methods': 'POST, OPTIONS',

    console.log(`📈 Calculated score: ${score}%`)

        "Create and deploy your first DeFi application",

    const reportData = generateAnalysis(userAnswers, score)

            "Establish connections with other Web3 professionals"    userAddress: '',

    const sessionId = sessionContext?.session_id || reportData.sessionId

    reportData.sessionId = sessionId      ],

    reportData.userAddress = userAddress || 'anonymous'

      risk_assessment: `Based on your responses, you show a ${score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'developing'} foundation for success in Web3. Continue building technical skills while maintaining focus on practical application and industry networking.`,    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,      const responseLength = answer.user_response.trim().length    'Content-Type': 'application/json',

    console.log(`💾 Saving report to database...`)

      next_steps: [

    try {

      const { error: dbError } = await supabase        "Continue with CTD Skill Compass learning modules",    timestamp: new Date().toISOString(),

        .from('user_analysis_reports')

        .insert([{        "Apply knowledge through hands-on blockchain projects",

          session_id: sessionId,

          user_address: userAddress || 'anonymous',        "Connect with Web3 professionals and mentors",    overallScore: score,      const contentQuality = Math.min(10, responseLength / 20)  }

          report_data: reportData,

          score: score,        "Stay updated with latest DeFi and blockchain trends",

          created_at: new Date().toISOString()

        }])        "Consider advanced certifications in your chosen specialization"    analysis: {



      if (dbError) {      ]

        console.error('Database save error:', dbError)

      } else {    },      executive_summary: `Based on your comprehensive ${userAnswers.length}-question assessment, you demonstrate strong engagement with Web3 and blockchain technologies. Your Binno AI assessment score of ${score}% reflects your current knowledge level and provides insights for your professional development journey.`,      totalScore += contentQuality

        console.log('✅ Report saved to database successfully')

      }    metadata: {

    } catch (saveError) {

      console.error('Error saving to database:', saveError)      totalQuestions: userAnswers.length,      strengths: [

    }

      completionTime: 'Assessment completed',

    console.log('🎉 Analysis completed successfully!')

      analysisVersion: 'Binno AI v2.0'        "Active learning approach to Web3 technologies",    }  // Handle preflight request

    return {

      statusCode: 200,    }

      headers,

      body: JSON.stringify({  }        "Demonstrated interest in blockchain innovation",

        report: reportData,

        sessionId: sessionId,  

        analysis: reportData.analysis.executive_summary,

        success: true  return analysisData        "Commitment to professional development in DeFi",  }  if (event.httpMethod === 'OPTIONS') {

      })

    }}



  } catch (error) {        "Understanding of decentralized technology concepts"

    console.error('❌ Error in final analysis:', error)

    exports.handler = async (event, context) => {

    return {

      statusCode: 500,  const headers = {      ],      return {

      headers,

      body: JSON.stringify({     'Access-Control-Allow-Origin': '*',

        error: 'Failed to generate analysis report',

        details: error.message    'Access-Control-Allow-Headers': 'Content-Type',      improvement_areas: [

      })

    }    'Access-Control-Allow-Methods': 'POST, OPTIONS',

  }

}    'Content-Type': 'application/json',        "Expand hands-on experience with smart contracts",  return Math.round((totalScore / (userAnswers.length * 10)) * 100)      statusCode: 200,

  }

        "Deepen understanding of DeFi protocols and mechanics", 

  if (event.httpMethod === 'OPTIONS') {

    return { statusCode: 200, headers, body: '' }        "Strengthen knowledge of blockchain security practices",}      headers,

  }

        "Develop practical skills in Web3 development tools"

  if (event.httpMethod !== 'POST') {

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }      ],      body: ''

  }

      recommendations: [

  try {

    console.log('🚀 Binno AI Final Analysis - Starting...')        "Focus on practical projects using testnet environments",// Generate professional analysis    }

    

    const { userAnswers, sessionContext, userAddress } = JSON.parse(event.body || '{}')        "Join Web3 communities for networking and collaborative learning",



    if (!userAnswers || userAnswers.length === 0) {        "Complete specialized courses in your areas of interest",function generateAnalysis(userAnswers, score) {  }

      return {

        statusCode: 400,        "Build a portfolio of blockchain projects to showcase skills"

        headers,

        body: JSON.stringify({ error: 'No user answers provided' })      ],  const analysisData = {

      }

    }      action_plan: [



    console.log(`📊 Processing ${userAnswers.length} answers...`)        "Set up development environment for smart contract testing",    reportId: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,  if (event.httpMethod !== 'POST') {



    const score = calculateScore(userAnswers)        "Complete foundational courses in blockchain development",

    console.log(`📈 Calculated score: ${score}%`)

        "Participate in Web3 hackathons and community events",    userAddress: '',    return {

    const reportData = generateAnalysis(userAnswers, score)

            "Create and deploy your first DeFi application",

    const sessionId = sessionContext?.session_id || reportData.sessionId

    reportData.sessionId = sessionId        "Establish connections with other Web3 professionals"    sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,      statusCode: 405,

    reportData.userAddress = userAddress || 'anonymous'

      ],

    console.log(`💾 Saving report to database...`)

      risk_assessment: `Based on your responses, you show a ${score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'developing'} foundation for success in Web3. Continue building technical skills while maintaining focus on practical application and industry networking.`,    timestamp: new Date().toISOString(),      headers,

    try {

      const { error: dbError } = await supabase      next_steps: [

        .from('user_analysis_reports')

        .insert([{        "Continue with CTD Skill Compass learning modules",    overallScore: score,      body: JSON.stringify({ error: 'Method not allowed' })

          session_id: sessionId,

          user_address: userAddress || 'anonymous',        "Apply knowledge through hands-on blockchain projects",

          report_data: reportData,

          score: score,        "Connect with Web3 professionals and mentors",    analysis: {    }

          created_at: new Date().toISOString()

        }])        "Stay updated with latest DeFi and blockchain trends",



      if (dbError) {        "Consider advanced certifications in your chosen specialization"      executive_summary: `Based on your comprehensive ${userAnswers.length}-question assessment, you demonstrate strong engagement with Web3 and blockchain technologies. Your Binno AI assessment score of ${score}% reflects your current knowledge level and provides insights for your professional development journey.`,  }

        console.error('Database save error:', dbError)

      } else {      ]

        console.log('✅ Report saved to database successfully')

      }    },      strengths: [

    } catch (saveError) {

      console.error('Error saving to database:', saveError)    metadata: {

    }

      totalQuestions: userAnswers.length,        "Active learning approach to Web3 technologies",  try {

    console.log('🎉 Analysis completed successfully!')

      completionTime: 'Assessment completed',

    return {

      statusCode: 200,      analysisVersion: 'Binno AI v2.0'        "Demonstrated interest in blockchain innovation",    const { userAnswers }: { userAnswers: UserAnswer[] } = JSON.parse(event.body || '{}')

      headers,

      body: JSON.stringify({    }

        report: reportData,

        sessionId: sessionId,  }        "Commitment to professional development in DeFi",

        analysis: reportData.analysis.executive_summary,

        success: true  

      })

    }  return analysisData        "Understanding of decentralized technology concepts"    if (!userAnswers || !Array.isArray(userAnswers) || userAnswers.length === 0) {



  } catch (error) {}

    console.error('❌ Error in final analysis:', error)

          ],      return {

    return {

      statusCode: 500,exports.handler = async (event, context) => {

      headers,

      body: JSON.stringify({   const headers = {      improvement_areas: [        statusCode: 400,

        error: 'Failed to generate analysis report',

        details: error.message    'Access-Control-Allow-Origin': '*',

      })

    }    'Access-Control-Allow-Headers': 'Content-Type',        "Expand hands-on experience with smart contracts",        headers,

  }

}    'Access-Control-Allow-Methods': 'POST, OPTIONS',

    'Content-Type': 'application/json',        "Deepen understanding of DeFi protocols and mechanics",         body: JSON.stringify({ error: 'Invalid user answers. Must provide array of answers.' })

  }

        "Strengthen knowledge of blockchain security practices",      }

  if (event.httpMethod === 'OPTIONS') {

    return { statusCode: 200, headers, body: '' }        "Develop practical skills in Web3 development tools"    }

  }

      ],

  if (event.httpMethod !== 'POST') {

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }      recommendations: [    // Ensure OpenAI API key is available

  }

        "Focus on practical projects using testnet environments",    if (!OPENAI_API_KEY) {

  try {

    console.log('🚀 Binno AI Final Analysis - Starting...')        "Join Web3 communities for networking and collaborative learning",      return {

    

    const { userAnswers, sessionContext, userAddress } = JSON.parse(event.body || '{}')        "Complete specialized courses in your areas of interest",        statusCode: 500,



    if (!userAnswers || userAnswers.length === 0) {        "Build a portfolio of blockchain projects to showcase skills"        headers,

      return {

        statusCode: 400,      ],        body: JSON.stringify({ error: 'OpenAI API key not configured. AI analysis is mandatory for this questionnaire.' })

        headers,

        body: JSON.stringify({ error: 'No user answers provided' })      action_plan: [      }

      }

    }        "Set up development environment for smart contract testing",    }



    console.log(`📊 Processing ${userAnswers.length} answers...`)        "Complete foundational courses in blockchain development",



    // Calculate score        "Participate in Web3 hackathons and community events",    const binno = new BinnoAI(OPENAI_API_KEY)

    const score = calculateScore(userAnswers)

    console.log(`📈 Calculated score: ${score}%`)        "Create and deploy your first DeFi application",    console.log('BinnoAI instance created for final analysis')



    // Generate comprehensive analysis        "Establish connections with other Web3 professionals"

    const reportData = generateAnalysis(userAnswers, score)

          ],    const sessionId = `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Use provided sessionId or generate new one

    const sessionId = sessionContext?.session_id || reportData.sessionId      risk_assessment: `Based on your responses, you show a ${score >= 70 ? 'strong' : score >= 50 ? 'moderate' : 'developing'} foundation for success in Web3. Continue building technical skills while maintaining focus on practical application and industry networking.`,    const analysisReport = await binno.generateFinalAnalysis(sessionId, userAnswers)

    reportData.sessionId = sessionId

    reportData.userAddress = userAddress || 'anonymous'      next_steps: [    console.log('Final analysis generated successfully')



    console.log(`💾 Saving report to database...`)        "Continue with CTD Skill Compass learning modules",



    // Save to Supabase        "Apply knowledge through hands-on blockchain projects",    // Extract just the narrative for the frontend

    try {

      const { error: dbError } = await supabase        "Connect with Web3 professionals and mentors",    const analysis = analysisReport.ai_analysis_narrative

        .from('user_analysis_reports')

        .insert([{        "Stay updated with latest DeFi and blockchain trends",

          session_id: sessionId,

          user_address: userAddress || 'anonymous',        "Consider advanced certifications in your chosen specialization"    return {

          report_data: reportData,

          score: score,      ]      statusCode: 200,

          created_at: new Date().toISOString()

        }])    },      headers,



      if (dbError) {    metadata: {      body: JSON.stringify({

        console.error('Database save error:', dbError)

        // Continue anyway - don't fail the request      totalQuestions: userAnswers.length,        analysis,

      } else {

        console.log('✅ Report saved to database successfully')      completionTime: 'Assessment completed',        questionsAnalyzed: userAnswers.length,

      }

    } catch (saveError) {      analysisVersion: 'Binno AI v2.0'        generatedAt: new Date().toISOString(),

      console.error('Error saving to database:', saveError)

      // Continue anyway - don't fail the request    }        fullReport: analysisReport // Include full report for potential future use

    }

  }      })

    console.log('🎉 Analysis completed successfully!')

      }

    // Return response in format expected by frontend

    return {  return analysisData

      statusCode: 200,

      headers,}  } catch (error) {

      body: JSON.stringify({

        report: reportData,    console.error('Error generating final analysis:', error)

        sessionId: sessionId,

        analysis: reportData.analysis.executive_summary,exports.handler = async (event, context) => {    

        success: true

      })  const headers = {    return {

    }

    'Access-Control-Allow-Origin': '*',      statusCode: 500,

  } catch (error) {

    console.error('❌ Error in final analysis:', error)    'Access-Control-Allow-Headers': 'Content-Type',      headers,

    

    return {    'Access-Control-Allow-Methods': 'POST, OPTIONS',      body: JSON.stringify({ 

      statusCode: 500,

      headers,    'Content-Type': 'application/json',        error: 'Failed to generate final analysis',

      body: JSON.stringify({ 

        error: 'Failed to generate analysis report',  }        details: process.env.NODE_ENV === 'development' ? error : undefined

        details: error.message

      })      })

    }

  }  if (event.httpMethod === 'OPTIONS') {    }

}
    return { statusCode: 200, headers, body: '' }  }

  }}

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) }
  }

  try {
    console.log('🚀 Binno AI Final Analysis - Starting...')
    
    const { userAnswers, sessionContext, userAddress } = JSON.parse(event.body || '{}')

    if (!userAnswers || userAnswers.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No user answers provided' })
      }
    }

    console.log(`📊 Processing ${userAnswers.length} answers...`)

    // Calculate score
    const score = calculateScore(userAnswers)
    console.log(`📈 Calculated score: ${score}%`)

    // Generate comprehensive analysis
    const reportData = generateAnalysis(userAnswers, score)
    
    // Use provided sessionId or generate new one
    const sessionId = sessionContext?.session_id || reportData.sessionId
    reportData.sessionId = sessionId
    reportData.userAddress = userAddress || 'anonymous'

    console.log(`💾 Saving report to database...`)

    // Save to Supabase
    try {
      const { error: dbError } = await supabase
        .from('user_analysis_reports')
        .insert([{
          session_id: sessionId,
          user_address: userAddress || 'anonymous',
          report_data: reportData,
          score: score,
          created_at: new Date().toISOString()
        }])

      if (dbError) {
        console.error('Database save error:', dbError)
        // Continue anyway - don't fail the request
      } else {
        console.log('✅ Report saved to database successfully')
      }
    } catch (saveError) {
      console.error('Error saving to database:', saveError)
      // Continue anyway - don't fail the request
    }

    console.log('🎉 Analysis completed successfully!')

    // Return response in format expected by frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        report: reportData,
        sessionId: sessionId,
        analysis: reportData.analysis.executive_summary,
        success: true
      })
    }

  } catch (error) {
    console.error('❌ Error in final analysis:', error)
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to generate analysis report',
        details: error.message
      })
    }
  }
}