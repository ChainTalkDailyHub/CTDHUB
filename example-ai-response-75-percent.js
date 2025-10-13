// Teste para demonstrar como a AI responde para score acima de 70%

// Simulação de respostas de um usuário experiente (Score: 75%)
const mockHighScoreAnswers = [
  {
    "question_text": "Tell me about your Web3 project. What is the project name, how many tokens do you plan to launch, on which blockchain network (BNB Chain, Ethereum, etc.), and what is the main focus of the project (DeFi, GameFi, NFTs, dApp, productivity tool, etc.)? Also describe the overall vision and the problem your project aims to solve.",
    "user_response": "EduChain is a decentralized learning platform built on BNB Smart Chain. We're launching two tokens: EDU (governance) with 100M total supply and LEARN (utility) with 50M supply. The project focuses on Web3 education through gamified learning modules, NFT certificates, and DeFi yield farming for educational rewards. Our smart contracts are deployed at 0x123...abc and audited by CertiK. The platform addresses the knowledge gap in Web3 adoption by providing structured learning paths with verifiable credentials on-chain."
  },
  {
    "question_text": "How does the project ensure the security and efficiency of its smart contracts within the technical architecture?",
    "user_response": "Our smart contracts follow OpenZeppelin standards and implement multi-sig wallets for critical functions. We use Chainlink oracles for external data feeds and have implemented time-locked admin functions. All contracts went through formal verification with Mythril and received a 95/100 security score from CertiK audit. Gas optimization includes batch operations and efficient storage patterns. Emergency pause mechanisms are built-in, and we maintain a bug bounty program with ImmuneFi."
  },
  {
    "question_text": "How does the economic model of CTD token incentivize users to engage with the platform?",
    "user_response": "The dual-token model creates sustainable incentives: EDU holders vote on curriculum updates and earn staking rewards (8% APY). LEARN tokens are earned through course completion (10-50 tokens per module) and can be used for premium content access or staked in learning pools for additional rewards. We maintain a treasury-backed token buyback mechanism and have partnerships with 15+ Web3 projects for real job placement, creating tangible utility beyond speculation."
  }
];

// Simulação da resposta que a AI daria para este perfil
console.log("=== ANÁLISE BINNO AI PARA SCORE 75% ===\n");

const mockAIResponse = {
  "executive_summary": "Com base em 15 respostas detalhadas, sua pontuação atual é 75%. Demonstra sólido conhecimento técnico em Web3, experiência prática com smart contracts e compreensão avançada de tokenomics. Este perfil indica prontidão para implementação com algumas otimizações estratégicas recomendadas.",
  
  "strengths": [
    "Conhecimento técnico sólido em arquitetura de smart contracts e padrões de segurança",
    "Experiência comprovada com auditorias de segurança (CertiK, Mythril)",
    "Modelo de tokenomics bem estruturado com utilidade clara e sustentabilidade",
    "Implementação de melhores práticas (OpenZeppelin, multi-sig, timelock)",
    "Visão clara de produto com foco em resolução de problemas reais",
    "Conhecimento de ferramentas profissionais (Chainlink, ImmuneFi, formal verification)"
  ],
  
  "weaknesses": [
    "Parcerias mencionadas (15+ projetos) precisam de validação mais específica",
    "Estratégia de go-to-market poderia ser mais detalhada",
    "Métricas de sucesso e KPIs não foram claramente definidos",
    "Análise competitiva limitada no contexto atual do mercado"
  ],
  
  "improvements": [
    "Documentar mais detalhadamente as parcerias estratégicas com evidências",
    "Desenvolver roadmap técnico com marcos específicos e timeframes",
    "Criar dashboard de métricas para tracking de performance do protocolo",
    "Estabelecer programa formal de community building e governança descentralizada",
    "Implementar sistema de analytics on-chain para otimização contínua"
  ],
  
  "study_plan": [
    {
      "area": "Advanced DeFi Architecture",
      "priority": "Medium",
      "resources": [
        "Uniswap V3 whitepaper analysis",
        "Compound governance deep dive",
        "MEV protection strategies"
      ],
      "timeframe": "3-4 semanas",
      "evidence": "Forte base técnica, mas pode aprofundar em protocolos DeFi mais complexos"
    },
    {
      "area": "Tokenomics Optimization",
      "priority": "High",
      "resources": [
        "Token engineering courses (Outlier Ventures)",
        "Balancer smart pools documentation",
        "Case studies de projetos sustentáveis"
      ],
      "timeframe": "2-3 semanas",
      "evidence": "Modelo atual é bom, mas precisa de refinamento para longevidade"
    }
  ],
  
  "learning_resources": [
    {
      "topic": "Protocol Analytics",
      "type": "Tool",
      "name": "Dune Analytics Advanced Queries",
      "url": "https://dune.com/learn",
      "reason": "Para implementar tracking avançado de métricas do protocolo"
    },
    {
      "topic": "Security Best Practices",
      "type": "Course",
      "name": "Smart Contract Security Verification",
      "url": "https://consensys.net/diligence/",
      "reason": "Manter-se atualizado com últimas vulnerabilidades e patches"
    }
  ],
  
  "risks": [
    "Dependência de parcerias não validadas pode afetar tração inicial",
    "Modelo dual-token adiciona complexidade que precisa ser bem comunicada",
    "Competição acirrada no espaço de educação Web3"
  ],
  
  "next_actions": [
    "Validar e documentar formalmente as 15+ parcerias mencionadas",
    "Criar MVP funcional com 3-5 módulos educacionais para teste beta",
    "Estabelecer métricas claras de sucesso (DAU, retention, completion rates)",
    "Preparar strategy paper para captação de investimento ou grants",
    "Implementar programa de beta testers com early adopters",
    "Desenvolver documentation técnica completa para desenvolvedores"
  ]
};

console.log("EXECUTIVE SUMMARY:");
console.log(mockAIResponse.executive_summary);
console.log("\n📊 SCORE: 75%\n");

console.log("💪 STRENGTHS:");
mockAIResponse.strengths.forEach((strength, i) => {
  console.log(`${i + 1}. ${strength}`);
});

console.log("\n📈 AREAS FOR IMPROVEMENT:");
mockAIResponse.weaknesses.forEach((weakness, i) => {
  console.log(`${i + 1}. ${weakness}`);
});

console.log("\n💡 RECOMMENDATIONS:");
mockAIResponse.improvements.forEach((improvement, i) => {
  console.log(`${i + 1}. ${improvement}`);
});

console.log("\n📚 STUDY PLAN:");
mockAIResponse.study_plan.forEach((plan, i) => {
  console.log(`\n${i + 1}. ${plan.area} (${plan.priority} Priority)`);
  console.log(`   Timeframe: ${plan.timeframe}`);
  console.log(`   Resources: ${plan.resources.join(', ')}`);
  console.log(`   Evidence: ${plan.evidence}`);
});

console.log("\n⚠️ RISKS:");
mockAIResponse.risks.forEach((risk, i) => {
  console.log(`${i + 1}. ${risk}`);
});

console.log("\n🎯 IMMEDIATE ACTIONS (Next 30 Days):");
mockAIResponse.next_actions.forEach((action, i) => {
  console.log(`${i + 1}. ${action}`);
});

console.log("\n" + "=".repeat(80));
console.log("💡 DIFERENÇAS PARA SCORES MAIS BAIXOS:");
console.log("• Score 30-50%: Foco em fundamentos básicos, penalidades por copy-paste");
console.log("• Score 50-70%: Conhecimento intermediário, mais recursos de estudo");
console.log("• Score 70%+: Refinamento estratégico, otimizações avançadas");
console.log("=".repeat(80));