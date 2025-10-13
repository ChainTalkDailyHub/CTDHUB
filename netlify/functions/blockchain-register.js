const { ethers } = require('ethers')

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Content-Type': 'application/json',
}

// Smart Contract Configuration
const CONTRACT_ADDRESS = '0xE478e7779Ab22600A2E98bb9A3CA138029b901F5'
const BSC_RPC = process.env.BSC_RPC || 'https://bsc-dataseed.binance.org'

// Smart Contract ABI (minimal for recordAssessment)
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "components": [
          {"name": "user", "type": "address"},
          {"name": "assessmentDate", "type": "uint64"},
          {"name": "criPercent", "type": "uint16"},
          {"name": "questionnaireVersion", "type": "uint16"},
          {"name": "numQuestions", "type": "uint8"},
          {"name": "pillarLevels", "type": "uint8[8]"},
          {"name": "contentHash", "type": "bytes32"},
          {"name": "uri", "type": "string"}
        ],
        "name": "a",
        "type": "tuple"
      }
    ],
    "name": "recordAssessment",
    "outputs": [{"name": "id", "type": "bytes32"}],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

// Generate pillar scores from overall score
function generatePillarScores(overallScore) {
  const baseLevel = Math.floor(overallScore / 25) // 0-4 base level
  const variation = Math.floor(overallScore / 12.5) % 2
  
  return Array(8).fill(0).map((_, i) => {
    let level = baseLevel
    if (i % 2 === 0) level = Math.min(4, level + variation)
    if (i % 3 === 0) level = Math.max(0, level - 1)
    return Math.max(0, Math.min(4, level))
  })
}

// Generate canonical hash
function generateCanonicalHash(reportData, sessionId, score) {
  const canonicalData = {
    assessment_date: new Date().toISOString().slice(0, 10),
    cri_percent: score,
    num_questions: Math.min(reportData.metadata?.totalQuestions || 15, 15),
    pillar_scores: generatePillarScores(score),
    questionnaire_version: 1,
    report_uri: `ipfs://ctdhub-binno-${sessionId}`,
    session_id: sessionId,
    top_risks: reportData.analysis?.risk_assessment ? [reportData.analysis.risk_assessment] : [],
    next_steps_14d: reportData.analysis?.next_steps || []
  }
  
  function sortKeys(obj) {
    if (Array.isArray(obj)) return obj.map(sortKeys)
    if (obj && typeof obj === 'object') {
      return Object.keys(obj).sort().reduce((acc, k) => {
        acc[k] = sortKeys(obj[k])
        return acc
      }, {})
    }
    return obj
  }
  
  const sorted = sortKeys(canonicalData)
  const canonicalString = JSON.stringify(sorted)
  return ethers.keccak256(ethers.toUtf8Bytes(canonicalString))
}

exports.handler = async (event, context) => {
  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: ''
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const { reportData, sessionId, userAddress, score } = JSON.parse(event.body)

    if (!reportData || !sessionId || !userAddress || score === undefined) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Missing required fields' })
      }
    }

    console.log('🔗 Preparing blockchain registration data for user signature...')
    
    // Generate data for contract
    const contentHash = generateCanonicalHash(reportData, sessionId, score)
    const pillarLevels = generatePillarScores(score)
    const assessmentDate = Math.floor(Date.now() / 1000)
    const uri = `ipfs://ctdhub-binno-${sessionId}`
    
    // Prepare assessment input
    const assessmentInput = {
      user: userAddress,
      assessmentDate: assessmentDate,
      criPercent: Math.min(100, Math.max(0, score)),
      questionnaireVersion: 1,
      numQuestions: Math.min(reportData.metadata?.totalQuestions || 15, 15),
      pillarLevels: pillarLevels,
      contentHash: contentHash,
      uri: uri
    }

    // Prepare contract call data for frontend
    console.log('📝 Assessment data prepared for blockchain registration')
    
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        success: true,
        contractAddress: CONTRACT_ADDRESS,
        contractABI: CONTRACT_ABI,
        assessmentInput: assessmentInput,
        contentHash: contentHash,
        rpcUrl: BSC_RPC,
        explorerUrl: `https://bscscan.com/address/${CONTRACT_ADDRESS}`,
        message: 'Assessment data prepared. User needs to sign transaction.'
      })
    }

  } catch (error) {
    console.error('❌ Error preparing blockchain registration:', error)
    
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ 
        error: 'Failed to prepare blockchain registration',
        details: error.message
      })
    }
  }
}