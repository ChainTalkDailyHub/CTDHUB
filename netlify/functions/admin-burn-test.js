// Função temporária para testar burn (versão simplificada)
exports.handler = async (event, context) => {
  console.log('🔥 Temporary Burn Function - Start')
  
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    }
  }

  try {
    const body = JSON.parse(event.body || '{}')
    const { userAddress, amount = '1000' } = body

    if (!userAddress || !userAddress.startsWith('0x')) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Valid wallet address required' })
      }
    }

    // Simular burn bem-sucedido para teste
    const result = {
      success: true,
      txHash: `0x${Math.random().toString(16).substr(2, 64)}`,
      amount: amount,
      burnAddress: '0x000000000000000000000000000000000000dead',
      userAddress: userAddress,
      message: `Successfully burned ${amount} CTD tokens (TEST MODE)`
    }

    console.log('✅ Test burn completed:', result)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Unknown error'
      })
    }
  }
}