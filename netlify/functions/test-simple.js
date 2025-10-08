// Função super simples para testar se o Netlify está executando a versão correta
exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  console.log('🔍 Simple test function called')
  console.log('Method:', event.httpMethod)
  console.log('Timestamp:', new Date().toISOString())
  
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      message: 'Simple test function is working!',
      timestamp: new Date().toISOString(),
      method: event.httpMethod,
      version: 'enhanced-debug-v1'
    })
  }
}