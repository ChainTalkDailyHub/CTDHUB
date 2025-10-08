export interface QuizQuestion {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface QuizModule {
  id: number
  title: string
  description: string
  questions: QuizQuestion[]
}

export const quizModules: QuizModule[] = [
  {
    id: 1,
    title: "Blockchain Fundamentals",
    description: "Learn the core concepts of blockchain technology",
    questions: [
      {
        id: 1,
        question: "What is a blockchain?",
        options: [
          "A type of cryptocurrency",
          "A distributed ledger technology",
          "A programming language",
          "A web browser"
        ],
        correctAnswer: 2,
        explanation: "A blockchain is a distributed ledger technology that maintains a continuously growing list of records."
      },
      {
        id: 2,
        question: "What makes blockchain secure?",
        options: [
          "Central authority",
          "Password protection", 
          "Firewall systems",
          "Cryptographic hashing"
        ],
        correctAnswer: 4,
        explanation: "Cryptographic hashing ensures the integrity and immutability of blockchain data."
      },
      {
        id: 3,
        question: "What is a block in blockchain?",
        options: [
          "A physical storage device",
          "A collection of transactions",
          "A type of cryptocurrency",
          "A mining algorithm"
        ],
        correctAnswer: 2,
        explanation: "A block is a collection of transactions that are bundled together and added to the blockchain."
      },
      {
        id: 4,
        question: "What is consensus in blockchain?",
        options: [
          "A voting system",
          "A type of contract", 
          "Agreement among network participants",
          "A mining reward"
        ],
        correctAnswer: 3,
        explanation: "Consensus is the agreement mechanism that ensures all network participants agree on the state of the blockchain."
      },
      {
        id: 5,
        question: "What is a hash function?",
        options: [
          "A cooking recipe",
          "A mathematical function that converts input to fixed output",
          "A type of blockchain",
          "A cryptocurrency wallet"
        ],
        correctAnswer: 2,
        explanation: "A hash function is a mathematical function that converts input data into a fixed-size string of characters."
      },
      {
        id: 6,
        question: "What is immutability in blockchain?",
        options: [
          "Ability to change data",
          "Fast transaction processing",
          "Low transaction fees",
          "Data cannot be altered once recorded"
        ],
        correctAnswer: 4,
        explanation: "Immutability means that once data is recorded on the blockchain, it cannot be altered or deleted."
      },
      {
        id: 7,
        question: "What is decentralization?",
        options: [
          "Having a single point of control",
          "Distribution of power across multiple nodes",
          "Government regulation",
          "Bank supervision"
        ],
        correctAnswer: 2,
        explanation: "Decentralization refers to the distribution of power and control across multiple nodes rather than a single authority."
      },
      {
        id: 8,
        question: "What is a node in blockchain?",
        options: [
          "A computer in the network",
          "A type of cryptocurrency",
          "A trading platform",
          "A wallet address"
        ],
        correctAnswer: 1,
        explanation: "A node is a computer that participates in the blockchain network by maintaining a copy of the ledger."
      },
      {
        id: 9,
        question: "What is proof of work?",
        options: [
          "Employment certificate",
          "Consensus mechanism requiring computational work",
          "Smart contract audit",
          "Trading strategy"
        ],
        correctAnswer: 2,
        explanation: "Proof of Work is a consensus mechanism where miners compete to solve computational puzzles to validate transactions."
      },
      {
        id: 10,
        question: "What is a genesis block?",
        options: [
          "The last block in a chain",
          "The first block in a blockchain",
          "A corrupted block",
          "A mining reward block"
        ],
        correctAnswer: 2,
        explanation: "The genesis block is the very first block in a blockchain, serving as the foundation for all subsequent blocks."
      }
    ]
  },
  {
    id: 2,
    title: "Smart Contracts",
    description: "Understanding self-executing contracts on blockchain",
    questions: [
      {
        id: 1,
        question: "What is a smart contract?",
        options: [
          "A legal document",
          "A trading algorithm",
          "A mobile app",
          "Self-executing code on blockchain"
        ],
        correctAnswer: 4,
        explanation: "Smart contracts are self-executing contracts with terms directly written into code."
      },
      {
        id: 2,
        question: "Which language is commonly used for Ethereum smart contracts?",
        options: [
          "JavaScript",
          "Python",
          "Solidity",
          "Java"
        ],
        correctAnswer: 3,
        explanation: "Solidity is the primary programming language for writing smart contracts on Ethereum."
      },
      {
        id: 3,
        question: "What is gas in Ethereum?",
        options: [
          "Transaction fee unit",
          "A type of fuel",
          "A programming language",
          "A wallet type"
        ],
        correctAnswer: 1,
        explanation: "Gas is the unit used to measure the computational effort required to execute operations on Ethereum."
      },
      {
        id: 4,
        question: "What is an ABI in smart contracts?",
        options: [
          "Application Binary Interface",
          "Automatic Blockchain Integration",
          "Advanced Block Index",
          "Asset Balance Indicator"
        ],
        correctAnswer: 1,
        explanation: "ABI (Application Binary Interface) defines how to interact with smart contract functions and data."
      },
      {
        id: 5,
        question: "What is a modifier in Solidity?",
        options: [
          "A variable type",
          "Code that can be reused to change function behavior",
          "A smart contract template",
          "A transaction type"
        ],
        correctAnswer: 2,
        explanation: "Modifiers are reusable code that can modify the behavior of functions, often used for access control."
      },
      {
        id: 6,
        question: "What is the purpose of 'require()' in Solidity?",
        options: [
          "Import external libraries",
          "Validate conditions and revert if false",
          "Create new variables",
          "Deploy contracts"
        ],
        correctAnswer: 2,
        explanation: "The require() function validates conditions and reverts the transaction if the condition is false."
      },
      {
        id: 7,
        question: "What is contract deployment?",
        options: [
          "Running a contract locally",
          "Publishing contract code to blockchain",
          "Testing contract functions",
          "Editing contract code"
        ],
        correctAnswer: 2,
        explanation: "Contract deployment is the process of publishing smart contract code to the blockchain network."
      },
      {
        id: 8,
        question: "What is a constructor in smart contracts?",
        options: [
          "Function called when contract is deployed",
          "Function to destroy contracts",
          "Function to modify variables",
          "Function to send transactions"
        ],
        correctAnswer: 1,
        explanation: "A constructor is a special function that runs only once when the smart contract is deployed."
      },
      {
        id: 9,
        question: "What is an event in Solidity?",
        options: [
          "Error handling mechanism",
          "Way to emit logs from smart contracts",
          "Function parameter",
          "Variable declaration"
        ],
        correctAnswer: 2,
        explanation: "Events are a way for smart contracts to communicate and log information that can be listened to by applications."
      },
      {
        id: 10,
        question: "What is gas optimization?",
        options: [
          "Increasing gas prices",
          "Reducing computational cost of operations",
          "Using more gas",
          "Avoiding gas usage"
        ],
        correctAnswer: 2,
        explanation: "Gas optimization involves writing efficient code to reduce the computational cost and fees of smart contract operations."
      }
    ]
  },
  {
    id: 3,
    title: "DeFi Fundamentals",
    description: "Decentralized Finance protocols and concepts",
    questions: [
      {
        id: 1,
        question: "What does DeFi stand for?",
        options: [
          "Digital Finance",
          "Distributed Finance", 
          "Decentralized Finance",
          "Deferred Finance"
        ],
        correctAnswer: 3,
        explanation: "DeFi stands for Decentralized Finance, referring to financial services built on blockchain."
      },
      {
        id: 2,
        question: "What is a DEX?",
        options: [
          "Decentralized Exchange",
          "Digital Exchange",
          "Distributed Exchange",
          "Dynamic Exchange"
        ],
        correctAnswer: 1,
        explanation: "A DEX (Decentralized Exchange) allows users to trade cryptocurrencies without intermediaries."
      },
      {
        id: 3,
        question: "What is TVL in DeFi?",
        options: [
          "Total Value Locked",
          "Transaction Volume Limit",
          "Token Value List",
          "Trade Volume Level"
        ],
        correctAnswer: 1,
        explanation: "TVL (Total Value Locked) represents the total amount of assets deposited in DeFi protocols."
      },
      {
        id: 4,
        question: "What is an AMM?",
        options: [
          "Automated Market Maker",
          "Advanced Money Manager",
          "Asset Management Module",
          "Algorithmic Mining Method"
        ],
        correctAnswer: 1,
        explanation: "AMM (Automated Market Maker) is a protocol that uses algorithms to price assets and provide liquidity."
      },
      {
        id: 5,
        question: "What is slippage in trading?",
        options: [
          "Transaction fee",
          "Difference between expected and actual price",
          "Network congestion",
          "Price volatility"
        ],
        correctAnswer: 2,
        explanation: "Slippage is the difference between the expected price and the actual execution price of a trade."
      },
      {
        id: 6,
        question: "What is staking?",
        options: [
          "Selling tokens",
          "Locking tokens to earn rewards",
          "Trading tokens",
          "Burning tokens"
        ],
        correctAnswer: 2,
        explanation: "Staking involves locking up tokens in a protocol to earn rewards or participate in governance."
      },
      {
        id: 7,
        question: "What is governance token?",
        options: [
          "Government-issued currency",
          "Stable cryptocurrency",
          "Mining reward token",
          "Token giving voting rights in protocol decisions"
        ],
        correctAnswer: 4,
        explanation: "Governance tokens give holders voting rights to participate in protocol governance and decision-making."
      },
      {
        id: 8,
        question: "What is composability in DeFi?",
        options: [
          "Creating new tokens",
          "Price stability",
          "Transaction speed",
          "Ability to combine different protocols"
        ],
        correctAnswer: 4,
        explanation: "Composability allows DeFi protocols to interact and build upon each other, creating complex financial products."
      },
      {
        id: 9,
        question: "What is a wrapped token?",
        options: [
          "Encrypted token",
          "Staked token",
          "Token representing another asset on different blockchain",
          "Burned token"
        ],
        correctAnswer: 3,
        explanation: "Wrapped tokens represent assets from one blockchain on another blockchain, enabling cross-chain functionality."
      },
      {
        id: 10,
        question: "What is permissionless in DeFi?",
        options: [
          "Requires approval to use",
          "Anyone can access without authorization",
          "Government regulated",
          "Bank supervised"
        ],
        correctAnswer: 2,
        explanation: "Permissionless means anyone can access and use DeFi protocols without requiring approval from authorities."
      }
    ]
  },
  {
    id: 4,
    title: "Trading Strategies",
    description: "Learn about crypto trading and market analysis",
    questions: [
      {
        id: 1,
        question: "What is arbitrage in crypto trading?",
        options: [
          "Buying low and selling high",
          "Holding long-term",
          "Exploiting price differences across exchanges",
          "Day trading"
        ],
        correctAnswer: 3,
        explanation: "Arbitrage involves exploiting price differences of the same asset across different exchanges."
      },
      {
        id: 2,
        question: "What is HODLing?",
        options: [
          "Hold On for Dear Life - long-term holding strategy",
          "High-frequency trading",
          "Options trading",
          "Derivatives trading"
        ],
        correctAnswer: 1,
        explanation: "HODLing is a long-term investment strategy where you hold assets regardless of market volatility."
      },
      {
        id: 3,
        question: "What is DCA?",
        options: [
          "Dollar Cost Averaging",
          "Digital Currency Analysis",
          "Decentralized Currency Algorithm",
          "Direct Coin Access"
        ],
        correctAnswer: 1,
        explanation: "DCA (Dollar Cost Averaging) involves regularly investing fixed amounts regardless of price to reduce volatility impact."
      },
      {
        id: 4,
        question: "What is technical analysis?",
        options: [
          "Analyzing code quality",
          "Reviewing fundamentals",
          "Checking network security",
          "Studying price charts and patterns"
        ],
        correctAnswer: 4,
        explanation: "Technical analysis involves studying price charts, patterns, and indicators to predict future price movements."
      },
      {
        id: 5,
        question: "What is a stop-loss order?",
        options: [
          "Order to buy at low price",
          "Order to hold position",
          "Order to increase position",
          "Order to sell when price drops to limit losses"
        ],
        correctAnswer: 4,
        explanation: "A stop-loss order automatically sells an asset when its price falls to a predetermined level to limit losses."
      },
      {
        id: 6,
        question: "What is market cap?",
        options: [
          "Maximum number of coins",
          "Daily trading volume",
          "Total value of all coins in circulation",
          "Price per coin"
        ],
        correctAnswer: 3,
        explanation: "Market cap is the total value of all coins in circulation, calculated by multiplying price by circulating supply."
      },
      {
        id: 7,
        question: "What is FOMO?",
        options: [
          "Fear of Missing Out",
          "Fast Order Management Option",
          "Fixed Order Market Operation",
          "Flexible Online Money Order"
        ],
        correctAnswer: 1,
        explanation: "FOMO (Fear of Missing Out) is the anxiety of missing profitable opportunities, often leading to impulsive decisions."
      },
      {
        id: 8,
        question: "What is FUD?",
        options: [
          "Fear, Uncertainty, and Doubt",
          "Fast User Decision",
          "Financial Update Data",
          "Flexible Utility Design"
        ],
        correctAnswer: 1,
        explanation: "FUD (Fear, Uncertainty, and Doubt) refers to spreading negative information to influence market sentiment."
      },
      {
        id: 9,
        question: "What is a bull market?",
        options: [
          "Market with declining prices",
          "Market with rising prices",
          "Stable market",
          "Volatile market"
        ],
        correctAnswer: 2,
        explanation: "A bull market is characterized by rising prices and positive investor sentiment over an extended period."
      },
      {
        id: 10,
        question: "What is a bear market?",
        options: [
          "Market with rising prices",
          "Market with declining prices",
          "Stable market",
          "New market"
        ],
        correctAnswer: 2,
        explanation: "A bear market is characterized by declining prices and negative investor sentiment over an extended period."
      }
    ]
  },
  {
    id: 5,
    title: "Security Auditing",
    description: "Smart contract security and auditing practices",
    questions: [
      {
        id: 1,
        question: "What is a reentrancy attack?",
        options: [
          "Multiple function calls",
          "Recursive external calls before state updates",
          "Network congestion",
          "Memory overflow"
        ],
        correctAnswer: 2,
        explanation: "Reentrancy attacks occur when external calls are made before state updates are completed."
      },
      {
        id: 2,
        question: "What is integer overflow?",
        options: [
          "Variable exceeding maximum value",
          "Too many variables",
          "Network overload",
          "Gas limit exceeded"
        ],
        correctAnswer: 1,
        explanation: "Integer overflow occurs when arithmetic operations result in values exceeding the maximum limit of the data type."
      },
      {
        id: 3,
        question: "What is a smart contract audit?",
        options: [
          "Financial review",
          "Performance testing",
          "Security review of contract code",
          "User interface review"
        ],
        correctAnswer: 3,
        explanation: "A smart contract audit is a thorough security review of contract code to identify vulnerabilities and bugs."
      },
      {
        id: 4,
        question: "What is access control?",
        options: [
          "Network permissions",
          "File permissions",
          "Restricting function access to authorized users",
          "Database access"
        ],
        correctAnswer: 3,
        explanation: "Access control ensures that only authorized users can execute certain functions in smart contracts."
      },
      {
        id: 5,
        question: "What is a front-running attack?",
        options: [
          "Racing to submit transactions first",
          "Running contracts faster",
          "Leading development teams",
          "Priority transaction processing"
        ],
        correctAnswer: 1,
        explanation: "Front-running involves observing pending transactions and submitting similar transactions with higher gas fees to execute first."
      },
      {
        id: 6,
        question: "What is flash loan attack?",
        options: [
          "Very fast loan processing",
          "High-frequency lending",
          "Exploiting protocols using uncollateralized loans",
          "Instant loan approval"
        ],
        correctAnswer: 3,
        explanation: "Flash loan attacks exploit DeFi protocols by borrowing large amounts without collateral within a single transaction."
      },
      {
        id: 7,
        question: "What is a honeypot contract?",
        options: [
          "Sweet reward contract",
          "Malicious contract that traps funds",
          "Bee farming contract",
          "High-yield contract"
        ],
        correctAnswer: 2,
        explanation: "Honeypot contracts are malicious smart contracts designed to trap users' funds and prevent withdrawals."
      },
      {
        id: 8,
        question: "What is oracle manipulation?",
        options: [
          "Predicting future prices",
          "Attacking price feed data sources",
          "Managing oracle nodes",
          "Oracle performance tuning"
        ],
        correctAnswer: 2,
        explanation: "Oracle manipulation involves attacking external data sources to provide false information to smart contracts."
      },
      {
        id: 9,
        question: "What is sandwich attack?",
        options: [
          "Eating during trading",
          "Placing trades before and after target transaction",
          "Multiple layer security",
          "Compressed transaction format"
        ],
        correctAnswer: 2,
        explanation: "Sandwich attacks involve placing buy and sell orders around a target transaction to profit from price impact."
      },
      {
        id: 10,
        question: "What is formal verification?",
        options: [
          "Legal document review",
          "Mathematical proof of contract correctness",
          "Identity verification",
          "Transaction confirmation"
        ],
        correctAnswer: 2,
        explanation: "Formal verification uses mathematical methods to prove that smart contract code behaves correctly according to specifications."
      }
    ]
  },
  {
    id: 6,
    title: "Yield Farming",
    description: "Understanding DeFi yield generation strategies",
    questions: [
      {
        id: 1,
        question: "What is yield farming?",
        options: [
          "Growing crops",
          "Lending crypto for rewards",
          "Mining cryptocurrency",
          "Staking tokens"
        ],
        correctAnswer: 2,
        explanation: "Yield farming involves lending or staking crypto assets to earn rewards or interest."
      },
      {
        id: 2,
        question: "What is APY?",
        options: [
          "Annual Percentage Yield",
          "Asset Price Yearly",
          "Automated Pool Yield",
          "Average Performance Yearly"
        ],
        correctAnswer: 1,
        explanation: "APY (Annual Percentage Yield) shows the real rate of return on investment, including compound interest."
      },
      {
        id: 3,
        question: "What is liquidity mining?",
        options: [
          "Mining with liquid cooling",
          "Earning tokens by providing liquidity",
          "Extracting liquid assets",
          "Mining underwater"
        ],
        correctAnswer: 2,
        explanation: "Liquidity mining rewards users with tokens for providing liquidity to decentralized exchanges or protocols."
      },
      {
        id: 4,
        question: "What is farming strategy optimization?",
        options: [
          "Maximizing yield while minimizing risks",
          "Crop rotation techniques", 
          "Farm equipment upgrade",
          "Seasonal planning"
        ],
        correctAnswer: 1,
        explanation: "Farming strategy optimization involves finding the best balance between high yields and acceptable risk levels."
      },
      {
        id: 5,
        question: "What is auto-compounding?",
        options: [
          "Automatic farm expansion",
          "Mechanical farming",
          "Compound fertilizer",
          "Automatically reinvesting earned rewards"
        ],
        correctAnswer: 4,
        explanation: "Auto-compounding automatically reinvests earned rewards to maximize returns through compound interest."
      },
      {
        id: 6,
        question: "What is pool2 farming?",
        options: [
          "Farming with LP tokens of project's own token",
          "Swimming pool investment",
          "Second-tier farming",
          "Double pool strategy"
        ],
        correctAnswer: 1,
        explanation: "Pool2 farming involves providing liquidity using a project's own governance token paired with another asset."
      },
      {
        id: 7,
        question: "What is vampire attack in yield farming?",
        options: [
          "Night trading strategy",
          "Blood-sucking investment",
          "Protocol attracting liquidity from competitors",
          "Dark pool trading"
        ],
        correctAnswer: 3,
        explanation: "Vampire attacks involve new protocols offering higher yields to attract liquidity away from established competitors."
      },
      {
        id: 8,
        question: "What is mercenary capital?",
        options: [
          "Military funding",
          "Private military investment",
          "War economy investment",
          "Capital that moves for highest yields without loyalty"
        ],
        correctAnswer: 4,
        explanation: "Mercenary capital refers to funds that quickly move between protocols seeking the highest yields without long-term commitment."
      },
      {
        id: 9,
        question: "What is a rug pull in farming?",
        options: [
          "Carpet cleaning service",
          "Floor decoration strategy",
          "Interior design method",
          "Sudden withdrawal of liquidity by developers"
        ],
        correctAnswer: 4,
        explanation: "A rug pull occurs when developers suddenly withdraw all liquidity from a project, leaving investors with worthless tokens."
      },
      {
        id: 10,
        question: "What is yield optimization protocol?",
        options: [
          "Farming equipment automation",
          "Crop yield prediction", 
          "Protocol automatically finding best yield opportunities",
          "Agricultural optimization"
        ],
        correctAnswer: 3,
        explanation: "Yield optimization protocols automatically move funds between different farming opportunities to maximize returns."
      }
    ]
  },
  {
    id: 7,
    title: "Liquidity Pools",
    description: "How decentralized exchanges work",
    questions: [
      {
        id: 1,
        question: "What is a liquidity pool?",
        options: [
          "A swimming pool",
          "A mining pool",
          "Collection of funds for trading",
          "A wallet type"
        ],
        correctAnswer: 3,
        explanation: "Liquidity pools are collections of funds locked in smart contracts to facilitate trading."
      },
      {
        id: 2,
        question: "What is an LP token?",
        options: [
          "Long Position token",
          "Liquidity Provider token representing pool share",
          "Low Price token",
          "Limited Partnership token"
        ],
        correctAnswer: 2,
        explanation: "LP tokens are issued to liquidity providers as proof of their contribution to a liquidity pool."
      },
      {
        id: 3,
        question: "What is the constant product formula?",
        options: [
          "x + y = k",
          "x - y = k",
          "x / y = k",
          "x * y = k"
        ],
        correctAnswer: 4,
        explanation: "The constant product formula (x * y = k) is used by AMMs to determine asset prices based on pool reserves."
      },
      {
        id: 4,
        question: "What causes impermanent loss?",
        options: [
          "Pool fees",
          "Network congestion",
          "Smart contract bugs",
          "Price divergence of pooled assets"
        ],
        correctAnswer: 4,
        explanation: "Impermanent loss occurs when the price ratio of pooled assets changes compared to when they were deposited."
      },
      {
        id: 5,
        question: "What is pool depth?",
        options: [
          "Amount of liquidity available for trading",
          "Physical depth of pool",
          "Number of pool participants",
          "Pool creation date"
        ],
        correctAnswer: 1,
        explanation: "Pool depth refers to the total amount of liquidity available, affecting price impact of large trades."
      },
      {
        id: 6,
        question: "What is a concentrated liquidity pool?",
        options: [
          "Pool where liquidity is focused in specific price ranges",
          "Pool with high concentration of users",
          "Pool with concentrated ownership",
          "Pool with high token concentration"
        ],
        correctAnswer: 1,
        explanation: "Concentrated liquidity allows providers to allocate liquidity within specific price ranges for capital efficiency."
      },
      {
        id: 7,
        question: "What are trading fees in pools?",
        options: [
          "Fees paid to exchanges",
          "Fees distributed to liquidity providers",
          "Government taxes",
          "Network gas fees"
        ],
        correctAnswer: 2,
        explanation: "Trading fees are collected from traders and distributed proportionally to liquidity providers as rewards."
      },
      {
        id: 8,
        question: "What is just-in-time (JIT) liquidity?",
        options: [
          "Fast liquidity provision",
          "Emergency liquidity",
          "Adding liquidity right before large trades",
          "Instant liquidity removal"
        ],
        correctAnswer: 3,
        explanation: "JIT liquidity involves adding liquidity just before large trades to capture fees, then immediately removing it."
      },
      {
        id: 9,
        question: "What is a bonding curve?",
        options: [
          "Bond investment strategy",
          "Curve for bond trading",
          "Interest rate curve",
          "Mathematical function determining token price"
        ],
        correctAnswer: 4,
        explanation: "Bonding curves are mathematical functions that determine token prices based on supply and demand dynamics."
      },
      {
        id: 10,
        question: "What is liquidity bootstrapping?",
        options: [
          "Initial process of adding liquidity to new pools",
          "Starting a computer",
          "Boot-shaped liquidity",
          "Emergency liquidity provision"
        ],
        correctAnswer: 1,
        explanation: "Liquidity bootstrapping involves gradually building up liquidity in new pools to establish stable trading pairs."
      }
    ]
  },
  {
    id: 8,
    title: "Arbitrage Opportunities",
    description: "Finding and exploiting price differences",
    questions: [
      {
        id: 1,
        question: "When is arbitrage most profitable?",
        options: [
          "During high volatility",
          "During stable markets",
          "At night only",
          "On weekends"
        ],
        correctAnswer: 1,
        explanation: "Arbitrage opportunities are most common during high volatility when price differences emerge."
      },
      {
        id: 2,
        question: "What is cross-exchange arbitrage?",
        options: [
          "Trading on multiple exchanges",
          "Exploiting price differences between exchanges",
          "Exchanging different cryptocurrencies",
          "Cross-border trading"
        ],
        correctAnswer: 2,
        explanation: "Cross-exchange arbitrage involves buying on one exchange and selling on another to profit from price differences."
      },
      {
        id: 3,
        question: "What is triangular arbitrage?",
        options: [
          "Trading with three people",
          "Using three different exchanges",
          "Exploiting price differences across three currencies",
          "Triangle-shaped trading pattern"
        ],
        correctAnswer: 3,
        explanation: "Triangular arbitrage involves trading between three currencies to exploit inconsistencies in exchange rates."
      },
      {
        id: 4,
        question: "What is statistical arbitrage?",
        options: [
          "Using statistics for trading",
          "Statistical analysis of markets",
          "Probability-based trading",
          "Exploiting statistical relationships between assets"
        ],
        correctAnswer: 4,
        explanation: "Statistical arbitrage exploits pricing inefficiencies based on statistical relationships between different assets."
      },
      {
        id: 5,
        question: "What is latency arbitrage?",
        options: [
          "Delayed trading",
          "Late trading strategy",
          "Exploiting speed advantages in trade execution",
          "Timezone-based arbitrage"
        ],
        correctAnswer: 3,
        explanation: "Latency arbitrage involves using superior speed and technology to execute trades before others react to market changes."
      },
      {
        id: 6,
        question: "What is MEV in arbitrage?",
        options: [
          "Maximum Extractable Value",
          "Minimum Exchange Value",
          "Market Efficiency Value",
          "Miner Exchange Value"
        ],
        correctAnswer: 1,
        explanation: "MEV (Maximum Extractable Value) refers to profit extracted by miners/validators through transaction ordering and inclusion."
      },
      {
        id: 7,
        question: "What is flash arbitrage?",
        options: [
          "Very fast arbitrage",
          "Arbitrage using flash loans within single transaction",
          "Lightning-based arbitrage",
          "Instant arbitrage"
        ],
        correctAnswer: 2,
        explanation: "Flash arbitrage uses flash loans to execute arbitrage strategies within a single transaction without requiring capital."
      },
      {
        id: 8,
        question: "What limits arbitrage opportunities?",
        options: [
          "Government regulations",
          "Market hours",
          "Internet speed",
          "Transaction fees and slippage"
        ],
        correctAnswer: 4,
        explanation: "Transaction fees, gas costs, and slippage can eliminate arbitrage profits, especially for small price differences."
      },
      {
        id: 9,
        question: "What is funding rate arbitrage?",
        options: [
          "Exploiting funding rate differences in perpetual contracts",
          "Government funding arbitrage",
          "Project funding strategy",
          "Interest rate arbitrage"
        ],
        correctAnswer: 1,
        explanation: "Funding rate arbitrage involves exploiting differences in funding rates between perpetual futures contracts and spot markets."
      },
      {
        id: 10,
        question: "What is an arbitrage bot?",
        options: [
          "Robot for physical trading",
          "Automated software executing arbitrage strategies",
          "AI trading advisor",
          "Arbitration robot"
        ],
        correctAnswer: 2,
        explanation: "Arbitrage bots are automated software programs that continuously scan markets and execute arbitrage trades when profitable opportunities arise."
      }
    ]
  },
  {
    id: 9,
    title: "Risk Management",
    description: "Managing risks in DeFi and trading",
    questions: [
      {
        id: 1,
        question: "What is impermanent loss?",
        options: [
          "Permanent token loss",
          "Transaction fees",
          "Slippage costs",
          "Temporary price volatility loss"
        ],
        correctAnswer: 4,
        explanation: "Impermanent loss occurs when providing liquidity and token prices change relative to when you deposited."
      },
      {
        id: 2,
        question: "What is smart contract risk?",
        options: [
          "Risk of high gas fees",
          "Risk of bugs or vulnerabilities in contract code",
          "Risk of slow transactions",
          "Risk of network congestion"
        ],
        correctAnswer: 2,
        explanation: "Smart contract risk refers to potential losses due to bugs, vulnerabilities, or exploits in contract code."
      },
      {
        id: 3,
        question: "What is liquidation risk?",
        options: [
          "Risk of asset sale",
          "Risk of forced closure when collateral falls below threshold",
          "Risk of market closure",
          "Risk of account deletion"
        ],
        correctAnswer: 2,
        explanation: "Liquidation risk occurs when collateral value falls below required thresholds, forcing automatic position closure."
      },
      {
        id: 4,
        question: "What is position sizing?",
        options: [
          "Physical size of trading position",
          "Size of trading screen",
          "Number of positions held",
          "Determining appropriate investment amount per trade"
        ],
        correctAnswer: 4,
        explanation: "Position sizing involves determining the appropriate amount to invest in each trade based on risk tolerance."
      },
      {
        id: 5,
        question: "What is diversification?",
        options: [
          "Making trades more diverse",
          "Spreading investments across different assets",
          "Increasing trading variety",
          "Varying trading times"
        ],
        correctAnswer: 2,
        explanation: "Diversification involves spreading investments across different assets to reduce overall portfolio risk."
      },
      {
        id: 6,
        question: "What is Value at Risk (VaR)?",
        options: [
          "Risk of losing all value",
          "Statistical measure of potential loss over time period",
          "Risk of market volatility",
          "Risk assessment value"
        ],
        correctAnswer: 2,
        explanation: "VaR (Value at Risk) estimates the maximum potential loss of a portfolio over a specific time period with given confidence."
      },
      {
        id: 7,
        question: "What is correlation risk?",
        options: [
          "Risk of data correlation",
          "Risk of network correlation",
          "Risk of user correlation",
          "Risk when asset prices move together during stress"
        ],
        correctAnswer: 4,
        explanation: "Correlation risk occurs when seemingly diversified assets become highly correlated during market stress, reducing diversification benefits."
      },
      {
        id: 8,
        question: "What is slashing risk in staking?",
        options: [
          "Risk of price cuts",
          "Risk of losing staked tokens due to validator misbehavior",
          "Risk of reduced rewards",
          "Risk of account suspension"
        ],
        correctAnswer: 2,
        explanation: "Slashing risk involves losing a portion of staked tokens if the validator misbehaves or fails to meet network requirements."
      },
      {
        id: 9,
        question: "What is regulatory risk?",
        options: [
          "Risk of market regulation",
          "Risk of adverse regulatory changes affecting investments",
          "Risk of trading rules",
          "Risk of compliance costs"
        ],
        correctAnswer: 2,
        explanation: "Regulatory risk involves potential losses due to adverse changes in laws or regulations affecting cryptocurrency investments."
      },
      {
        id: 10,
        question: "What is a risk-reward ratio?",
        options: [
          "Ratio of risky to safe assets",
          "Comparison of potential profit to potential loss",
          "Ratio of winners to losers",
          "Reward distribution ratio"
        ],
        correctAnswer: 2,
        explanation: "Risk-reward ratio compares the potential profit of a trade to its potential loss, helping assess trade attractiveness."
      }
    ]
  },
  {
    id: 10,
    title: "Advanced Techniques",
    description: "Advanced DeFi strategies and techniques",
    questions: [
      {
        id: 1,
        question: "What is flash loan?",
        options: [
          "Very fast loan approval",
          "Uncollateralized loan in single transaction",
          "Small amount loan",
          "Emergency loan"
        ],
        correctAnswer: 2,
        explanation: "Flash loans are uncollateralized loans that must be borrowed and repaid within the same transaction."
      },
      {
        id: 2,
        question: "What is a complex DeFi strategy?",
        options: [
          "Difficult to understand strategy",
          "Multi-protocol strategy combining various DeFi primitives",
          "Complicated trading algorithm",
          "Advanced mathematics strategy"
        ],
        correctAnswer: 2,
        explanation: "Complex DeFi strategies combine multiple protocols and mechanisms to optimize yields and manage risks."
      },
      {
        id: 3,
        question: "What is recursive borrowing?",
        options: [
          "Borrowing repeatedly",
          "Using borrowed assets as collateral for more borrowing",
          "Circular loan agreement",
          "Automatic loan renewal"
        ],
        correctAnswer: 2,
        explanation: "Recursive borrowing involves using borrowed assets as collateral to borrow more, amplifying exposure and risk."
      },
      {
        id: 4,
        question: "What is a leveraged yield farming?",
        options: [
          "Farming with leverage tools",
          "High-yield farming strategy",
          "Mechanical farming leverage",
          "Borrowing to increase farming position size"
        ],
        correctAnswer: 4,
        explanation: "Leveraged yield farming involves borrowing assets to increase the size of farming positions and potential returns."
      },
      {
        id: 5,
        question: "What is cross-chain arbitrage?",
        options: [
          "Arbitrage across different blockchains",
          "Chain-to-chain trading",
          "Bridge arbitrage",
          "Multi-chain strategy"
        ],
        correctAnswer: 1,
        explanation: "Cross-chain arbitrage exploits price differences of the same asset across different blockchain networks."
      },
      {
        id: 6,
        question: "What is a delta-neutral strategy?",
        options: [
          "Zero-delta options",
          "Neutral market position",
          "Greek letter strategy",
          "Strategy unaffected by price movements"
        ],
        correctAnswer: 4,
        explanation: "Delta-neutral strategies are designed to be unaffected by small price movements in the underlying asset."
      },
      {
        id: 7,
        question: "What is automated portfolio rebalancing?",
        options: [
          "Manual portfolio adjustment",
          "Algorithmic adjustment of portfolio weights",
          "Balanced investment approach",
          "Portfolio balance checking"
        ],
        correctAnswer: 2,
        explanation: "Automated portfolio rebalancing uses algorithms to automatically adjust portfolio weights to maintain target allocations."
      },
      {
        id: 8,
        question: "What is a synthetic asset?",
        options: [
          "Artificial asset creation",
          "Fake cryptocurrency",
          "Manufactured token",
          "Asset that mimics price of another asset"
        ],
        correctAnswer: 4,
        explanation: "Synthetic assets are financial instruments that mimic the price and behavior of other assets without direct ownership."
      },
      {
        id: 9,
        question: "What is options strategies in DeFi?",
        options: [
          "Multiple choice strategies",
          "Derivatives strategies for hedging and speculation",
          "Alternative investment options",
          "Strategy selection methods"
        ],
        correctAnswer: 2,
        explanation: "Options strategies in DeFi use derivatives contracts to hedge risks or speculate on price movements with defined risk profiles."
      },
      {
        id: 10,
        question: "What is algorithmic trading in DeFi?",
        options: [
          "Algorithm development",
          "Automated trading using predefined rules and algorithms",
          "Mathematical trading methods",
          "Computer-based analysis"
        ],
        correctAnswer: 2,
        explanation: "Algorithmic trading uses computer programs to automatically execute trades based on predefined rules and market conditions."
      }
    ]
  }
]