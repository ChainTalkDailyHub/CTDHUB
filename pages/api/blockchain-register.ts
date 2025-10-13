import { NextApiRequest, NextApiResponse } from 'next'
import { ethers } from 'ethers'

// BSC Mainnet configuration
const BSC_RPC_URL = 'https://bsc-dataseed1.binance.org/'
const CONTRACT_ADDRESS = '0xE478e7779Ab22600A2E98bb9A3CA138029b901F5'

// Simple contract ABI - just the recordAssessment function
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "user", "type": "address" },
          { "internalType": "uint256", "name": "assessmentDate", "type": "uint256" },
          { "internalType": "uint8", "name": "criPercent", "type": "uint8" },
          { "internalType": "uint8", "name": "questionnaireVersion", "type": "uint8" },
          { "internalType": "uint8", "name": "numQuestions", "type": "uint8" },
          { "internalType": "uint8[8]", "name": "pillarLevels", "type": "uint8[8]" },
          { "internalType": "bytes32", "name": "contentHash", "type": "bytes32" },
          { "internalType": "string", "name": "uri", "type": "string" }
        ],
        "internalType": "struct AssessmentData",
        "name": "data",
        "type": "tuple"
      }
    ],
    "name": "recordAssessment",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "payable",
    "type": "function"
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('🔗 Blockchain register API called')
  
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    })
  }

  try {
    const { sessionId, userAddress, answers, reportHash, timestamp } = req.body

    console.log('📝 Registration data:', {
      sessionId,
      userAddress,
      answersCount: answers,
      reportHash: reportHash?.substring(0, 10) + '...',
      timestamp
    })

    // Validate required fields
    if (!sessionId || !userAddress || !answers || !reportHash) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: sessionId, userAddress, answers, reportHash'
      })
    }

    // Validate Ethereum address
    if (!ethers.isAddress(userAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format'
      })
    }

    // Setup provider and contract
    const provider = new ethers.JsonRpcProvider(BSC_RPC_URL)
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider)

    // Prepare assessment data for contract
    const assessmentData = {
      user: userAddress,
      assessmentDate: Math.floor(timestamp / 1000), // Convert to seconds
      criPercent: 75, // Default score - in real implementation, calculate from answers
      questionnaireVersion: 1,
      numQuestions: Math.min(answers, 15), // Ensure <= 15
      pillarLevels: [2, 2, 1, 2, 2, 1, 1, 2], // Default levels - calculate from answers
      contentHash: ethers.id(reportHash), // Create proper hash
      uri: `ipfs://QmExample${sessionId}` // Placeholder IPFS URI
    }

    console.log('🔗 Assessment data prepared:', assessmentData)

    // Note: This is a read-only operation for cost estimation
    // The actual transaction must be signed by the user's wallet in the frontend
    
    // Estimate gas for the transaction
    try {
      const gasEstimate = await contract.recordAssessment.estimateGas(assessmentData, {
        value: ethers.parseEther('0.001') // 0.001 BNB fee
      })
      
      console.log('⛽ Gas estimate:', gasEstimate.toString())
      
      // Return success with transaction data for frontend to sign
      return res.status(200).json({
        success: true,
        message: 'Blockchain registration prepared successfully',
        contractAddress: CONTRACT_ADDRESS,
        gasEstimate: gasEstimate.toString(),
        assessmentData,
        txValue: '0.001', // BNB
        network: 'BSC Mainnet',
        instructions: 'Use this data to call recordAssessment from your wallet'
      })
      
    } catch (gasError) {
      console.error('⛽ Gas estimation failed:', gasError)
      return res.status(500).json({
        success: false,
        error: 'Gas estimation failed - contract may not be accessible',
        details: gasError instanceof Error ? gasError.message : 'Unknown gas error'
      })
    }

  } catch (error) {
    console.error('❌ Blockchain register error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}