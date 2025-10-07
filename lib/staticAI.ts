// Simple AI responses for static deployment
export interface AIResponse {
  message: string
  suggestions?: string[]
}

// Predefined responses for common blockchain/Web3 questions
const aiResponses: Record<string, AIResponse> = {
  // DeFi related
  'defi': {
    message: `🔄 **DeFi (Decentralized Finance)** refers to a blockchain-based form of finance that doesn't rely on traditional financial intermediaries.

**Key Components:**
- **DEXs**: Decentralized exchanges like Uniswap, SushiSwap
- **Lending Protocols**: Compound, Aave, MakerDAO
- **Yield Farming**: Earning rewards by providing liquidity
- **Synthetic Assets**: Mirror Protocol, Synthetix

**Benefits:**
✅ 24/7 availability
✅ Global accessibility
✅ Reduced intermediaries
✅ Programmable money

**Risks:**
⚠️ Smart contract vulnerabilities
⚠️ Impermanent loss
⚠️ High gas fees
⚠️ Regulatory uncertainty`,
    suggestions: ['Explain yield farming', 'What is impermanent loss?', 'How do DEXs work?']
  },

  'yield farming': {
    message: `🌾 **Yield Farming** is the practice of earning rewards by providing liquidity to DeFi protocols.

**How it works:**
1. **Deposit tokens** into a liquidity pool
2. **Receive LP tokens** representing your share
3. **Earn rewards** in protocol tokens
4. **Compound gains** by reinvesting rewards

**Popular Strategies:**
- **Liquidity Mining**: Providing LP tokens to earn governance tokens
- **Staking**: Locking tokens for protocol security
- **Lending**: Earning interest on deposited assets

**Risks to Consider:**
⚠️ **Impermanent Loss**: Loss due to price divergence
⚠️ **Smart Contract Risk**: Potential bugs or exploits
⚠️ **Token Risk**: Governance tokens may lose value`,
    suggestions: ['What is impermanent loss?', 'Best yield farming strategies', 'How to calculate APY?']
  },

  'smart contracts': {
    message: `📜 **Smart Contracts** are self-executing contracts with terms directly written into code.

**Key Features:**
- **Immutable**: Cannot be changed once deployed
- **Transparent**: Code is publicly visible
- **Automatic**: Execute without intermediaries
- **Global**: Accessible from anywhere

**Popular Languages:**
- **Solidity**: Ethereum and EVM chains
- **Rust**: Solana, Near Protocol
- **Vyper**: Alternative to Solidity
- **JavaScript**: Some Web3 platforms

**Development Tools:**
🛠️ **Hardhat**: Development environment
🛠️ **Truffle**: Testing framework
🛠️ **Remix**: Online IDE
🛠️ **OpenZeppelin**: Security libraries`,
    suggestions: ['Solidity best practices', 'Smart contract security', 'How to deploy contracts?']
  },

  'blockchain security': {
    message: `🔒 **Blockchain Security** involves protecting against various attack vectors and vulnerabilities.

**Common Vulnerabilities:**
- **Reentrancy**: Recursive calls before state updates
- **Integer Overflow**: Arithmetic operations exceeding limits
- **Access Control**: Improper permission management
- **Front-running**: MEV exploitation

**Security Best Practices:**
✅ **Use established libraries** (OpenZeppelin)
✅ **Conduct thorough audits** before mainnet
✅ **Implement emergency pauses** for critical functions
✅ **Follow the checks-effects-interactions pattern**

**Audit Process:**
1. **Static Analysis**: Automated vulnerability scanning
2. **Manual Review**: Expert code examination
3. **Formal Verification**: Mathematical proofs
4. **Bug Bounties**: Community-driven testing`,
    suggestions: ['Common smart contract vulnerabilities', 'How to conduct an audit?', 'Best security tools']
  },

  'gas optimization': {
    message: `⛽ **Gas Optimization** techniques to reduce transaction costs on Ethereum.

**Common Strategies:**
- **Pack structs**: Minimize storage slots
- **Use events**: Cheaper than storage for logs
- **Batch operations**: Combine multiple calls
- **Optimize loops**: Reduce computational complexity

**Code Patterns:**
\`\`\`solidity
// Bad: Multiple storage writes
counter = counter + 1;
counter = counter + 1;

// Good: Single storage write
counter += 2;
\`\`\`

**Tools for Analysis:**
🔧 **Hardhat Gas Reporter**: Track gas usage
🔧 **Slither**: Static analysis tool
🔧 **Solhint**: Solidity linter`,
    suggestions: ['Storage optimization patterns', 'Loop optimization techniques', 'Gas estimation tools']
  },

  'web3 development': {
    message: `🌐 **Web3 Development** combines traditional web development with blockchain integration.

**Essential Libraries:**
- **ethers.js**: Ethereum JavaScript library
- **web3.js**: Original Ethereum library
- **wagmi**: React hooks for Ethereum
- **viem**: TypeScript-first Ethereum library

**Popular Frameworks:**
🚀 **Next.js**: React with SSR support
🚀 **Hardhat**: Smart contract development
🚀 **The Graph**: Decentralized indexing
🚀 **IPFS**: Decentralized storage

**Development Stack:**
1. **Frontend**: React/Next.js + Web3 libraries
2. **Smart Contracts**: Solidity + Hardhat
3. **Backend**: Node.js + blockchain RPCs
4. **Storage**: IPFS or Arweave`,
    suggestions: ['Best Web3 frameworks', 'How to connect wallets?', 'Blockchain integration guide']
  }
}

// Function to get AI response based on user input
export function getAIResponse(userMessage: string): AIResponse {
  const message = userMessage.toLowerCase()
  
  // Check for keywords in user message
  for (const [key, response] of Object.entries(aiResponses)) {
    if (message.includes(key.toLowerCase()) || 
        message.includes(key.replace(' ', '')) ||
        response.suggestions?.some(s => message.includes(s.toLowerCase()))) {
      return response
    }
  }

  // Default response for unmatched queries
  return {
    message: `🤖 **Hi! I'm BinnoAI, your Web3 specialist.**

I can help you with:
- **DeFi protocols** and yield farming strategies
- **Smart contract** development and security
- **Blockchain fundamentals** and consensus mechanisms
- **Gas optimization** and best practices
- **Web3 development** tools and frameworks

Try asking me about specific topics like "How does DeFi work?" or "Explain smart contracts".`,
    suggestions: [
      'How does DeFi work?',
      'Explain smart contracts',
      'What is yield farming?',
      'Blockchain security best practices'
    ]
  }
}

// Function to simulate typing delay for better UX
export function simulateTypingDelay(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, 1000 + Math.random() * 2000) // 1-3 second delay
  })
}