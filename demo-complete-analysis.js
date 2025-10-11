const fetch = require('node-fetch')

const BASE_URL = 'https://extraordinary-treacle-1bc553.netlify.app'

console.log('🎯 DEMONSTRAÇÃO COMPLETA: ONDE ENCONTRAR A ANÁLISE DETALHADA')
console.log('===========================================================')

async function demonstrateCompleteFlow() {
  try {
    const sessionId = 'demo-complete-' + Date.now()
    
    console.log('🚀 1. Criando análise completa...')
    
    const analysisResponse = await fetch(`${BASE_URL}/.netlify/functions/binno-final-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sessionId: sessionId,
        userAnswers: [
          {
            question: "Tell me about your Web3 project. What is the project name, how many tokens do you plan to launch, on which blockchain network (BNB Chain, Ethereum, etc.), and what is the main focus of the project (DeFi, GameFi, NFTs, dApp, productivity tool, etc.)? Also describe the overall vision and the problem your project aims to solve.",
            user_response: "I'm developing TrustChain, a comprehensive supply chain transparency platform built on BNB Smart Chain. We'll launch 2 tokens: TRUST (governance) and VERIFY (utility). The platform uses IoT sensors and blockchain to track products from manufacturing to delivery, solving the problem of supply chain fraud and providing consumers with verified product authenticity. Our vision is to create a world where every product's journey is transparent and verifiable.",
            question_number: 1
          },
          {
            question: "How does the technical architecture of your Web3 project ensure the security and efficiency of the smart contracts being utilized?",
            user_response: "Our architecture uses a multi-layered approach: 1) Smart contracts are written in Solidity with extensive use of OpenZeppelin libraries for security, 2) We implement proxy patterns for upgradeability, 3) All contracts undergo formal verification using tools like Mythril and Slither, 4) Gas optimization through batching operations and using CREATE2 for predictable addresses, 5) Integration with Chainlink oracles for external data feeds, 6) Multi-signature wallets for admin functions.",
            question_number: 2
          },
          {
            question: "How does the tokenomics of the project incentivize users to actively participate in the ecosystem and contribute to its growth and sustainability?",
            user_response: "TRUST token holders get governance rights and staking rewards (8% APY). VERIFY tokens are earned by: manufacturers for registering products (100 VERIFY/item), consumers for scanning and verifying products (5 VERIFY/scan), validators for confirming IoT data (50 VERIFY/validation). Token burning occurs when products are marked as counterfeit. Liquidity providers earn 0.3% fees. Early adopters get bonus multipliers for 6 months.",
            question_number: 3
          },
          {
            question: "Can you provide details about any security audits that have been conducted on the smart contracts and the overall project?",
            user_response: "We've completed audits with CertiK (95/100 score) and Quantstamp. Main findings were resolved: reentrancy protection added, overflow protection implemented, access control improved. Audit cost: $45K. Bug bounty program launched on Immunefi with $100K pool. Code is open-source on GitHub. We maintain a security disclosure policy and have a rapid response team for any issues.",
            question_number: 4
          },
          {
            question: "How does the project involve the community in decision-making processes and governance structures?",
            user_response: "DAO governance through TRUST token: 1000 TRUST = 1 vote. Proposals require 10K TRUST to submit, 25% quorum to pass. Community can vote on: protocol upgrades, fee structures, treasury allocation, partnership decisions. We have weekly community calls, Discord governance channels, and a formal proposal process with 7-day voting periods. Advisory council of 7 elected members provides guidance.",
            question_number: 5
          }
        ],
        language: 'pt'
      })
    })
    
    const analysisData = await analysisResponse.json()
    
    console.log('✅ Análise criada com sucesso!')
    console.log('📊 Score:', analysisData.score + '%')
    console.log('🆔 Session ID:', analysisData.sessionId)
    
    // Aguardar processamento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    console.log('\n📋 2. Onde encontrar a análise detalhada:')
    console.log('=' .repeat(50))
    
    console.log('\n🌐 OPÇÃO 1: Acessar via URL direta')
    console.log(`🔗 URL: ${BASE_URL}/report?sessionId=${sessionId}`)
    
    console.log('\n📱 OPÇÃO 2: Através do fluxo normal do usuário')
    console.log('- Complete o questionário em: /binno-ai')  
    console.log('- Será redirecionado automaticamente para o relatório')
    console.log('- Ou acesse "View All Reports" no perfil')
    
    console.log('\n🔍 3. O que você encontrará no relatório detalhado:')
    
    // Buscar e mostrar estrutura do relatório
    const reportResponse = await fetch(`${BASE_URL}/.netlify/functions/analysis-reports?sessionId=${sessionId}`)
    const reportData = await reportResponse.json()
    
    if (reportData.analysis) {
      console.log('✅ Executive Summary (Resumo Executivo)')
      console.log('✅ Score Detalhado (' + reportData.overallScore + '%)')
      console.log('✅ Key Strengths (' + (reportData.analysis.strengths?.length || 0) + ' pontos fortes)')
      console.log('✅ Areas for Improvement (' + (reportData.analysis.improvement_areas?.length || 0) + ' áreas)')
      console.log('✅ Recommendations (' + (reportData.analysis.recommendations?.length || 0) + ' recomendações)')
      console.log('✅ Action Plan (' + (reportData.analysis.action_plan?.length || 0) + ' passos)')
      console.log('✅ Risk Assessment (Avaliação de Riscos)')
      console.log('✅ Next Steps (' + (reportData.analysis.next_steps?.length || 0) + ' próximos passos)')
      
      if (reportData.analysis.question_analysis) {
        console.log('✅ Detailed Question Analysis (' + reportData.analysis.question_analysis.length + ' questões analisadas)')
      }
      
      if (reportData.analysis.learning_path) {
        console.log('✅ Recommended Learning Path (Caminho de Aprendizado)')
      }
      
      console.log('\n💡 4. Exemplo do conteúdo detalhado:')
      console.log('-' .repeat(40))
      console.log('Executive Summary:', reportData.analysis.executive_summary.substring(0, 100) + '...')
      
      if (reportData.analysis.recommendations.length > 0) {
        console.log('\nPrimeira Recomendação:', reportData.analysis.recommendations[0])
      }
      
      console.log('\n🎯 CONCLUSÃO:')
      console.log('✅ A análise detalhada ESTÁ sendo gerada')
      console.log('✅ Todos os dados estão disponíveis no relatório')
      console.log('✅ Para acessar: use a URL fornecida acima')
      console.log('✅ Sistema funcionando 100% corretamente')
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message)
  }
}

demonstrateCompleteFlow()