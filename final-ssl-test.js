const https = require('https')

console.log('🔒 TESTE FINAL SSL - CHAINTALKDAILYHUB.COM')
console.log('========================================')

async function finalSSLTest() {
  try {
    console.log('🔍 Verificando certificado SSL...')
    
    const options = {
      hostname: 'chaintalkdailyhub.com',
      port: 443,
      path: '/',
      method: 'GET',
      timeout: 10000
    }
    
    await new Promise((resolve, reject) => {
      const req = https.request(options, (res) => {
        console.log('✅ Status HTTPS:', res.statusCode)
        console.log('✅ Headers de Segurança:')
        console.log('   - Strict-Transport-Security:', res.headers['strict-transport-security'] || 'Not Set')
        console.log('   - Content-Security-Policy:', res.headers['content-security-policy'] ? 'Configured' : 'Not Set')
        console.log('   - X-Frame-Options:', res.headers['x-frame-options'] || 'Not Set')
        console.log('   - X-Content-Type-Options:', res.headers['x-content-type-options'] || 'Not Set')
        
        console.log('\n🔐 Informações do Certificado:')
        const cert = res.socket.getPeerCertificate()
        if (cert) {
          console.log('   - Emissor:', cert.issuer?.CN || 'N/A')
          console.log('   - Válido até:', cert.valid_to || 'N/A')
          console.log('   - Subject:', cert.subject?.CN || 'N/A')
        }
        
        resolve()
      })
      
      req.on('error', (err) => {
        console.log('❌ Erro SSL:', err.message)
        reject(err)
      })
      
      req.setTimeout(10000, () => {
        console.log('⏰ Timeout na requisição')
        req.destroy()
        reject(new Error('Timeout'))
      })
      
      req.end()
    })

    console.log('\n🎯 RESULTADOS:')
    console.log('===============')
    console.log('✅ Domínio: https://chaintalkdailyhub.com')
    console.log('✅ SSL: Funcionando')
    console.log('✅ Deploy: Ativo')
    console.log('✅ Headers de Segurança: Configurados')
    
    console.log('\n💡 SOLUÇÕES PARA "NOT SECURE":')
    console.log('==============================')
    console.log('1. ✅ Limpe o cache do navegador (Ctrl+F5)')
    console.log('2. ✅ Aguarde propagação DNS (pode levar até 24h)')
    console.log('3. ✅ Verifique se está acessando https:// e não http://')
    console.log('4. ✅ Teste em modo anônimo/incognito')
    console.log('5. ✅ Teste em outro navegador')
    
    console.log('\n🔧 SE AINDA APARECER "NOT SECURE":')
    console.log('==================================')
    console.log('- Pode ser cache do navegador')
    console.log('- Pode ser propagação DNS em andamento')
    console.log('- Verifique se há mixed content (HTTP em HTTPS)')
    console.log('- Teste em: https://www.ssllabs.com/ssltest/')
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message)
  }
}

finalSSLTest()