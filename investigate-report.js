const fetch = require('node-fetch')

const BASE_URL = 'https://extraordinary-treacle-1bc553.netlify.app'

console.log('🔍 INVESTIGANDO ESTRUTURA DE DADOS DO RELATÓRIO')
console.log('==============================================')

async function investigateReportStructure() {
  try {
    // Criar uma nova análise para investigação
    const sessionId = 'investigation-' + Date.now()
    
    console.log('🚀 Criando nova análise para investigação...')
    
    const analysisResponse = await fetch(`${BASE_URL}/.netlify/functions/binno-final-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: sessionId,
        userAnswers: [
          {
            question: "Tell me about your Web3 project",
            user_response: "I'm building a comprehensive DeFi protocol that combines yield farming with AI-powered risk assessment",
            question_number: 1
          },
          {
            question: "What blockchain will you use?",
            user_response: "We're using BNB Smart Chain for its low fees and high throughput, with plans to expand to Ethereum",
            question_number: 2
          },
          {
            question: "Who is your target market?",
            user_response: "DeFi enthusiasts, yield farmers, and institutional investors looking for automated strategies",
            question_number: 3
          }
        ],
        language: 'pt'
      })
    })
    
    const analysisData = await analysisResponse.json()
    console.log('✅ Análise criada com sucesso')
    
    // Aguardar um pouco
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Buscar relatório
    console.log('\n📋 Buscando estrutura completa do relatório...')
    const reportResponse = await fetch(`${BASE_URL}/.netlify/functions/analysis-reports?sessionId=${sessionId}`)
    const reportData = await reportResponse.json()
    
    console.log('\n🔍 ESTRUTURA COMPLETA DOS DADOS:')
    console.log('===============================')
    
    // Função para mostrar estrutura de objeto
    function showStructure(obj, indent = 0) {
      const spaces = '  '.repeat(indent)
      
      if (typeof obj === 'object' && obj !== null) {
        if (Array.isArray(obj)) {
          console.log(`${spaces}Array com ${obj.length} items:`)
          if (obj.length > 0) {
            console.log(`${spaces}  [0]: ${typeof obj[0]} - "${obj[0]?.toString().substring(0, 50)}..."`)
            if (obj.length > 1) {
              console.log(`${spaces}  [1]: ${typeof obj[1]} - "${obj[1]?.toString().substring(0, 50)}..."`)
            }
          }
        } else {
          Object.keys(obj).forEach(key => {
            const value = obj[key]
            console.log(`${spaces}${key}: ${typeof value}`)
            
            if (typeof value === 'string') {
              console.log(`${spaces}  "${value.substring(0, 100)}${value.length > 100 ? '...' : ''}"`)
            } else if (typeof value === 'object' && value !== null) {
              showStructure(value, indent + 1)
            } else {
              console.log(`${spaces}  ${value}`)
            }
          })
        }
      }
    }
    
    showStructure(reportData)
    
    console.log('\n🎯 VERIFICAÇÃO ESPECÍFICA DA ANÁLISE:')
    console.log('====================================')
    
    if (reportData.analysis) {
      console.log('✅ reportData.analysis existe')
      console.log('✅ executive_summary:', !!reportData.analysis.executive_summary)
      console.log('✅ strengths:', Array.isArray(reportData.analysis.strengths), `(${reportData.analysis.strengths?.length || 0} items)`)
      console.log('✅ improvement_areas:', Array.isArray(reportData.analysis.improvement_areas), `(${reportData.analysis.improvement_areas?.length || 0} items)`)
      console.log('✅ recommendations:', Array.isArray(reportData.analysis.recommendations), `(${reportData.analysis.recommendations?.length || 0} items)`)
      console.log('✅ action_plan:', Array.isArray(reportData.analysis.action_plan), `(${reportData.analysis.action_plan?.length || 0} items)`)
      console.log('✅ risk_assessment:', !!reportData.analysis.risk_assessment)
      console.log('✅ next_steps:', Array.isArray(reportData.analysis.next_steps), `(${reportData.analysis.next_steps?.length || 0} items)`)
    } else {
      console.log('❌ reportData.analysis NÃO existe')
    }
    
    if (reportData.report_data) {
      console.log('\n📊 VERIFICAÇÃO DO report_data:')
      console.log('✅ reportData.report_data existe')
      if (reportData.report_data.analysis) {
        console.log('✅ reportData.report_data.analysis existe')
      } else {
        console.log('❌ reportData.report_data.analysis NÃO existe')
      }
    }
    
    console.log('\n🎯 URL PARA ACESSAR O RELATÓRIO NO BROWSER:')
    console.log(`https://extraordinary-treacle-1bc553.netlify.app/report?sessionId=${sessionId}`)
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

investigateReportStructure()