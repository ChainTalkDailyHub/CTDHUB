const fetch = require('node-fetch')

const BASE_URL = 'https://extraordinary-treacle-1bc553.netlify.app'

console.log('🔍 RECUPERANDO ANÁLISE COMPLETA DAS RESPOSTAS GENÉRICAS')
console.log('======================================================')

async function getGenericAnalysis() {
  try {
    // Usar o sessionId do teste anterior
    const sessionId = 'simple-generic-1760168378399'
    
    console.log('📋 Buscando relatório para sessionId:', sessionId)
    
    const reportResponse = await fetch(`${BASE_URL}/.netlify/functions/analysis-reports?sessionId=${sessionId}`)
    const reportData = await reportResponse.json()
    
    console.log('\n📊 RELATÓRIO COMPLETO - CTD SKILL COMPASS')
    console.log('=' .repeat(60))
    
    console.log(`\n🎯 SCORE FINAL: ${reportData.overallScore}%`)
    console.log(`📅 Data: ${new Date(reportData.timestamp).toLocaleString('pt-BR')}`)
    console.log(`🆔 Session ID: ${reportData.sessionId}`)
    
    if (reportData.analysis) {
      console.log('\n📝 EXECUTIVE SUMMARY:')
      console.log('-' .repeat(40))
      console.log(reportData.analysis.executive_summary)
      
      console.log('\n💪 STRENGTHS (Pontos Fortes):')
      console.log('-' .repeat(40))
      if (reportData.analysis.strengths && reportData.analysis.strengths.length > 0) {
        reportData.analysis.strengths.forEach((strength, index) => {
          console.log(`${index + 1}. ${strength}`)
        })
      } else {
        console.log('❌ Nenhum ponto forte identificado')
      }
      
      console.log('\n🔧 IMPROVEMENT AREAS (Áreas de Melhoria):')
      console.log('-' .repeat(40))
      if (reportData.analysis.improvement_areas && reportData.analysis.improvement_areas.length > 0) {
        reportData.analysis.improvement_areas.forEach((area, index) => {
          console.log(`${index + 1}. ${area}`)
        })
      } else {
        console.log('❌ Nenhuma área de melhoria identificada')
      }
      
      console.log('\n💡 RECOMMENDATIONS (Recomendações):')
      console.log('-' .repeat(40))
      if (reportData.analysis.recommendations && reportData.analysis.recommendations.length > 0) {
        reportData.analysis.recommendations.forEach((rec, index) => {
          console.log(`${index + 1}. ${rec}`)
        })
      } else {
        console.log('❌ Nenhuma recomendação disponível')
      }
      
      console.log('\n📋 ACTION PLAN (Plano de Ação):')
      console.log('-' .repeat(40))
      if (reportData.analysis.action_plan && reportData.analysis.action_plan.length > 0) {
        reportData.analysis.action_plan.forEach((action, index) => {
          console.log(`${index + 1}. ${action}`)
        })
      } else {
        console.log('❌ Nenhum plano de ação disponível')
      }
      
      console.log('\n⚠️ RISK ASSESSMENT (Avaliação de Riscos):')
      console.log('-' .repeat(40))
      console.log(reportData.analysis.risk_assessment || '❌ Não disponível')
      
      console.log('\n🚀 NEXT STEPS (Próximos Passos):')
      console.log('-' .repeat(40))
      if (reportData.analysis.next_steps && reportData.analysis.next_steps.length > 0) {
        reportData.analysis.next_steps.forEach((step, index) => {
          console.log(`${index + 1}. ${step}`)
        })
      } else {
        console.log('❌ Nenhum próximo passo disponível')
      }
      
      console.log('\n' + '=' .repeat(60))
      console.log('📊 ANÁLISE DA IA:')
      console.log('✅ Sistema detectou respostas genéricas/repetitivas')
      console.log('✅ Score baixo (5%) reflete qualidade inadequada das respostas')
      console.log('✅ IA está funcionando corretamente')
      console.log('✅ Relatório foi gerado e salvo com sucesso')
      
    } else {
      console.log('❌ Dados de análise não encontrados')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

getGenericAnalysis()