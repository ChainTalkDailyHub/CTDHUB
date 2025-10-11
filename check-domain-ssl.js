const https = require('https')
const http = require('http')

console.log('🔍 DIAGNÓSTICO DO DOMÍNIO: chaintalkdailyhub.com')
console.log('==============================================')

async function checkDomainStatus() {
  // Teste HTTPS
  console.log('\n🔒 Testando HTTPS...')
  try {
    await new Promise((resolve, reject) => {
      const req = https.get('https://chaintalkdailyhub.com', (res) => {
        console.log('✅ HTTPS Status:', res.statusCode)
        console.log('✅ Headers SSL:', {
          'strict-transport-security': res.headers['strict-transport-security'],
          'content-security-policy': res.headers['content-security-policy']
        })
        resolve()
      })
      
      req.on('error', (err) => {
        console.log('❌ HTTPS Error:', err.message)
        reject(err)
      })
      
      req.setTimeout(10000, () => {
        console.log('⏰ HTTPS Timeout')
        req.destroy()
        reject(new Error('Timeout'))
      })
    })
  } catch (error) {
    console.log('❌ HTTPS falhou:', error.message)
  }

  // Teste HTTP
  console.log('\n🌐 Testando HTTP...')
  try {
    await new Promise((resolve, reject) => {
      const req = http.get('http://chaintalkdailyhub.com', (res) => {
        console.log('✅ HTTP Status:', res.statusCode)
        console.log('✅ Location header:', res.headers.location)
        resolve()
      })
      
      req.on('error', (err) => {
        console.log('❌ HTTP Error:', err.message)
        reject(err)
      })
      
      req.setTimeout(10000, () => {
        console.log('⏰ HTTP Timeout')
        req.destroy()
        reject(new Error('Timeout'))
      })
    })
  } catch (error) {
    console.log('❌ HTTP falhou:', error.message)
  }

  console.log('\n📋 SOLUÇÕES PARA "NOT SECURE":')
  console.log('==============================')
  console.log('1. ✅ Certificado SSL: Verificar se está ativo no Netlify')
  console.log('2. ✅ HTTPS Redirect: Forçar redirecionamento HTTP → HTTPS')
  console.log('3. ✅ HSTS Headers: Adicionar cabeçalhos de segurança')
  console.log('4. ✅ Mixed Content: Verificar se todos os recursos usam HTTPS')

  console.log('\n🔧 PRÓXIMOS PASSOS:')
  console.log('==================')
  console.log('1. Acesse: https://app.netlify.com/projects/extraordinary-treacle-1bc553')
  console.log('2. Vá em "Domain settings"')
  console.log('3. Verifique se chaintalkdailyhub.com tem SSL ativo')
  console.log('4. Ative "Force HTTPS" se necessário')
  console.log('5. Aguarde propagação DNS (até 24h)')
}

checkDomainStatus()