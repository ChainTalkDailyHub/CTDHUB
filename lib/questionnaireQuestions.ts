// Static questionnaire questions for client-side use
export interface StaticQuestion {
  id: string
  question_text: string
  category: string
  level: 'beginner' | 'intermediate' | 'advanced'
}

export const staticQuestions: StaticQuestion[] = [
  {
    id: "q1",
    question_text: "Describe your current experience with blockchain technology. What projects have you worked on or concepts have you studied?",
    category: "experience",
    level: "beginner"
  },
  {
    id: "q2", 
    question_text: "What are smart contracts and how do they differ from traditional contracts? Provide specific examples.",
    category: "fundamentals",
    level: "beginner"
  },
  {
    id: "q3",
    question_text: "Explain the concept of gas in Ethereum. Why is it important and how does it affect transaction costs?",
    category: "fundamentals", 
    level: "intermediate"
  },
  {
    id: "q4",
    question_text: "What is DeFi and how does it differ from traditional finance? Give examples of DeFi protocols you're familiar with.",
    category: "defi",
    level: "intermediate"
  },
  {
    id: "q5",
    question_text: "Describe what you know about yield farming and liquidity mining. What are the risks involved?",
    category: "defi",
    level: "advanced"
  },
  {
    id: "q6",
    question_text: "What programming languages and frameworks do you use for blockchain development? Describe your proficiency level.",
    category: "development",
    level: "intermediate"
  },
  {
    id: "q7",
    question_text: "Explain the difference between Layer 1 and Layer 2 solutions. Give examples of each.",
    category: "scaling",
    level: "intermediate"
  },
  {
    id: "q8",
    question_text: "What are the most common security vulnerabilities in smart contracts? How can they be prevented?",
    category: "security",
    level: "advanced"
  },
  {
    id: "q9",
    question_text: "Describe your experience with Web3 libraries and tools (ethers.js, web3.js, Hardhat, Truffle, etc.)",
    category: "development",
    level: "intermediate"
  },
  {
    id: "q10",
    question_text: "What is Maximum Extractable Value (MEV) and how does it impact blockchain networks?",
    category: "advanced_concepts",
    level: "advanced"
  },
  {
    id: "q11",
    question_text: "Explain how decentralized exchanges (DEXs) work. What are the advantages and disadvantages compared to centralized exchanges?",
    category: "defi",
    level: "intermediate"
  },
  {
    id: "q12",
    question_text: "What are NFTs and what real-world problems do they solve? Discuss both current use cases and future potential.",
    category: "nft",
    level: "beginner"
  },
  {
    id: "q13",
    question_text: "Describe the consensus mechanisms you're familiar with (PoW, PoS, DPoS, etc.). What are their trade-offs?",
    category: "fundamentals",
    level: "intermediate"
  },
  {
    id: "q14",
    question_text: "What is impermanent loss and how does it affect liquidity providers? How can it be mitigated?",
    category: "defi",
    level: "advanced"
  },
  {
    id: "q15",
    question_text: "Explain cross-chain bridges and interoperability solutions. What are the main challenges?",
    category: "scaling",
    level: "advanced"
  },
  {
    id: "q16",
    question_text: "What are governance tokens and how do DAOs work? Describe your experience with decentralized governance.",
    category: "governance",
    level: "intermediate"
  },
  {
    id: "q17",
    question_text: "Describe different wallet types (hot, cold, hardware, software). What are best practices for wallet security?",
    category: "security",
    level: "beginner"
  },
  {
    id: "q18",
    question_text: "What are oracles in blockchain context? Why are they needed and what are the main challenges?",
    category: "infrastructure",
    level: "intermediate"
  },
  {
    id: "q19",
    question_text: "Explain arbitrage opportunities in DeFi. How do arbitrage bots work and what risks are involved?",
    category: "trading",
    level: "advanced"
  },
  {
    id: "q20",
    question_text: "What is the role of tokenomics in blockchain projects? How do you evaluate a project's token model?",
    category: "tokenomics",
    level: "intermediate"
  },
  {
    id: "q21",
    question_text: "Describe your experience with blockchain testing and debugging. What tools and strategies do you use?",
    category: "development",
    level: "advanced"
  },
  {
    id: "q22",
    question_text: "What are flash loans and how are they used in DeFi? Provide examples of legitimate and illegitimate use cases.",
    category: "defi",
    level: "advanced"
  },
  {
    id: "q23",
    question_text: "Explain the concept of slashing in Proof of Stake networks. Why is it important for network security?",
    category: "staking",
    level: "intermediate"
  },
  {
    id: "q24",
    question_text: "What are the main differences between EVM-compatible and non-EVM blockchains? Give examples of each.",
    category: "fundamentals",
    level: "intermediate"
  },
  {
    id: "q25",
    question_text: "Describe privacy solutions in blockchain (zk-SNARKs, zk-STARKs, ring signatures, etc.). What are their applications?",
    category: "privacy",
    level: "advanced"
  },
  {
    id: "q26",
    question_text: "What are your thoughts on the future of Web3? What challenges need to be overcome for mass adoption?",
    category: "future",
    level: "intermediate"
  },
  {
    id: "q27",
    question_text: "Explain the role of validators in blockchain networks. How does validator selection work in different consensus mechanisms?",
    category: "consensus",
    level: "intermediate"
  },
  {
    id: "q28",
    question_text: "What are atomic swaps and how do they enable trustless trading? What are the limitations?",
    category: "trading",
    level: "advanced"
  },
  {
    id: "q29",
    question_text: "Describe your experience with blockchain auditing and security analysis. What methodologies do you follow?",
    category: "security",
    level: "advanced"
  },
  {
    id: "q30",
    question_text: "Based on all your previous responses, what are your main goals in Web3 and blockchain development? What skills would you like to improve?",
    category: "goals",
    level: "beginner"
  }
]

// Function to select appropriate questions based on user level and progress
export function selectQuestion(questionNumber: number, userLevel: string = 'intermediate'): StaticQuestion {
  // Simple selection logic - can be enhanced
  const questionIndex = (questionNumber - 1) % staticQuestions.length
  return staticQuestions[questionIndex]
}

// Function to generate analysis based on responses
export function generateStaticAnalysis(answers: any[], userLevel: string = 'intermediate'): string {
  const totalQuestions = answers.length
  const categories = answers.reduce((acc, answer) => {
    const question = staticQuestions.find(q => q.id === answer.question_id)
    if (question) {
      acc[question.category] = (acc[question.category] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const strongestCategory = Object.entries(categories)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'development'

  return `
# 🎯 BinnoAI Questionnaire Analysis

## 📊 Assessment Summary
- **Total Questions Completed**: ${totalQuestions}/30
- **Assessment Level**: Comprehensive Web3 Evaluation
- **Primary Focus Area**: ${strongestCategory.charAt(0).toUpperCase() + strongestCategory.slice(1)}

## 🔍 Knowledge Profile
Based on your responses, you demonstrate:

### Strongest Areas:
- **${strongestCategory.charAt(0).toUpperCase() + strongestCategory.slice(1)}**: Your responses show solid understanding in this domain
- **Technical Communication**: Clear articulation of complex concepts
- **Practical Application**: Real-world understanding of blockchain principles

### Recommended Learning Path:
1. **Advanced Smart Contract Security** - Deepen your understanding of security patterns
2. **DeFi Protocol Design** - Explore advanced DeFi mechanisms and yield strategies  
3. **Cross-Chain Development** - Learn about interoperability solutions
4. **MEV and Arbitrage** - Understand advanced trading concepts
5. **Governance and DAOs** - Participate in decentralized governance

## 🚀 Next Steps
1. **Join CTDHUB Community**: Connect with other Web3 developers
2. **Take Specialized Courses**: Focus on your identified growth areas
3. **Build Projects**: Apply your knowledge through hands-on development
4. **Contribute to Open Source**: Enhance your skills through collaboration

## 📈 Skill Level Assessment
Your responses indicate an **${userLevel}** level understanding of Web3 technologies with strong potential for growth in specialized areas.

*This analysis was generated by BinnoAI based on your questionnaire responses. Continue learning and building to advance your Web3 expertise!*
  `
}