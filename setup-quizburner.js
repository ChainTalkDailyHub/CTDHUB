#!/usr/bin/env node
/**
 * QuizBurner Setup Script
 * Automated configuration and deployment for CTDHUB QuizBurner system
 */

const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class QuizBurnerSetup {
  constructor() {
    this.config = {};
    this.envPath = path.join(__dirname, '.env.local');
  }

  async prompt(question) {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  async validatePrivateKey(privateKey) {
    try {
      const wallet = new ethers.Wallet(privateKey);
      return {
        valid: true,
        address: wallet.address
      };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid private key format'
      };
    }
  }

  async validateRpcUrl(rpcUrl) {
    try {
      const provider = new ethers.JsonRpcProvider(rpcUrl);
      await provider.getNetwork();
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Cannot connect to RPC URL'
      };
    }
  }

  async gatherConfiguration() {
    console.log('🔥 QuizBurner Setup - CTDHUB Platform');
    console.log('=====================================\n');

    // Network selection
    console.log('1. Select Network:');
    console.log('   1) BSC Mainnet (recommended for production)');
    console.log('   2) BSC Testnet (recommended for testing)');
    console.log('   3) opBNB Mainnet (low fees)');
    
    const networkChoice = await this.prompt('Choose network (1-3): ');
    
    switch(networkChoice) {
      case '1':
        this.config.network = 'bsc';
        this.config.rpcUrl = 'https://bsc-dataseed.binance.org/';
        this.config.chainId = 56;
        this.config.explorerBase = 'https://bscscan.com';
        break;
      case '2':
        this.config.network = 'bsc-testnet';
        this.config.rpcUrl = 'https://data-seed-prebsc-1-s1.binance.org:8545/';
        this.config.chainId = 97;
        this.config.explorerBase = 'https://testnet.bscscan.com';
        break;
      case '3':
        this.config.network = 'opbnb';
        this.config.rpcUrl = 'https://opbnb-mainnet-rpc.bnbchain.org';
        this.config.chainId = 204;
        this.config.explorerBase = 'https://opbnbscan.com';
        break;
      default:
        console.log('Invalid choice, using BSC Mainnet');
        this.config.network = 'bsc';
        this.config.rpcUrl = 'https://bsc-dataseed.binance.org/';
        this.config.chainId = 56;
        this.config.explorerBase = 'https://bscscan.com';
    }

    console.log(`\n✅ Selected: ${this.config.network.toUpperCase()}\n`);

    // Private key for deployment
    console.log('2. Deployer Private Key:');
    let deployerKey;
    while (true) {
      deployerKey = await this.prompt('Enter deployer private key (with or without 0x): ');
      if (!deployerKey.startsWith('0x')) {
        deployerKey = '0x' + deployerKey;
      }
      
      const validation = await this.validatePrivateKey(deployerKey);
      if (validation.valid) {
        this.config.deployerKey = deployerKey;
        this.config.deployerAddress = validation.address;
        console.log(`✅ Deployer address: ${validation.address}\n`);
        break;
      } else {
        console.log('❌ Invalid private key, please try again');
      }
    }

    // Treasury private key
    console.log('3. Treasury Private Key:');
    let treasuryKey;
    while (true) {
      treasuryKey = await this.prompt('Enter treasury private key (with or without 0x): ');
      if (!treasuryKey.startsWith('0x')) {
        treasuryKey = '0x' + treasuryKey;
      }
      
      const validation = await this.validatePrivateKey(treasuryKey);
      if (validation.valid) {
        this.config.treasuryKey = treasuryKey;
        this.config.treasuryAddress = validation.address;
        console.log(`✅ Treasury address: ${validation.address}\n`);
        break;
      } else {
        console.log('❌ Invalid private key, please try again');
      }
    }

    // API Keys
    console.log('4. API Configuration:');
    this.config.bscscanApiKey = await this.prompt('BSCScan API key (optional): ') || 'YourBscscanAPIKey';
    this.config.openaiApiKey = await this.prompt('OpenAI API key: ') || 'your_openai_api_key_here';

    // Burn configuration
    console.log('\n5. Burn Configuration:');
    const burnAmount = await this.prompt('Default burn amount in tokens (default: 1000): ') || '1000';
    this.config.burnAmount = burnAmount;

    console.log('\n6. Database Configuration:');
    this.config.supabaseUrl = await this.prompt('Supabase URL: ') || 'https://your-project.supabase.co';
    this.config.supabaseAnonKey = await this.prompt('Supabase Anon Key: ') || 'your-anon-key-here';
  }

  generateEnvFile() {
    const envContent = `# ===== BLOCKCHAIN CONFIGURATION =====
RPC_BSC=${this.config.network === 'bsc' ? this.config.rpcUrl : 'https://bsc-dataseed.binance.org/'}
RPC_OPBNB=${this.config.network === 'opbnb' ? this.config.rpcUrl : 'https://opbnb-mainnet-rpc.bnbchain.org'}
BSC_TESTNET_RPC=${this.config.network === 'bsc-testnet' ? this.config.rpcUrl : 'https://data-seed-prebsc-1-s1.binance.org:8545/'}

# ===== PRIVATE KEYS (NEVER COMMIT) =====
PRIVATE_KEY_DEPLOYER=${this.config.deployerKey}
PRIVATE_KEY_TREASURY=${this.config.treasuryKey}
ADMIN_PRIVATE_KEY=${this.config.deployerKey}

# ===== CONTRACT ADDRESSES =====
CTD_TOKEN_ADDRESS=0x7f890a4a575558307826C82e4cb6E671f3178bfc
CTD_CONTRACT_ADDRESS=0x7f890a4a575558307826C82e4cb6E671f3178bfc
TOKEN_ADDRESS=0x7f890a4a575558307826C82e4cb6E671f3178bfc
TREASURY_ADDRESS=${this.config.treasuryAddress}
QUIZ_BURNER_ADDRESS=will_be_set_after_deployment

# ===== API KEYS =====
BSCSCAN_API_KEY=${this.config.bscscanApiKey}
OPBNB_API_KEY=YourOpBNBScanAPIKey
OPENAI_API_KEY=${this.config.openaiApiKey}

# ===== BURN CONFIGURATION =====
BURN_AMOUNT=${this.config.burnAmount}

# ===== FRONTEND (PUBLIC) =====
NEXT_PUBLIC_CTD_TOKEN=0x7f890a4a575558307826C82e4cb6E671f3178bfc
NEXT_PUBLIC_CTD_TOKEN_ADDRESS=0x7f890a4a575558307826C82e4cb6E671f3178bfc
NEXT_PUBLIC_QUIZ_BURNER_ADDRESS=will_be_set_after_deployment
NEXT_PUBLIC_CHAIN_EXPLORER_BASE=${this.config.explorerBase}
NEXT_PUBLIC_CHAIN_ID=${this.config.chainId}
NEXT_PUBLIC_RPC_URL=${this.config.rpcUrl}

# ===== SUPABASE =====
NEXT_PUBLIC_SUPABASE_URL=${this.config.supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${this.config.supabaseAnonKey}

# ===== OTHER =====
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CTDHUB Platform
NEXT_PUBLIC_APP_VERSION=2.0.0
MAX_CONVERSION_PER_DAY=1000
CONVERSION_RATE=0.001
`;

    fs.writeFileSync(this.envPath, envContent);
    console.log(`\n✅ Environment file created: ${this.envPath}`);
  }

  generateDeployScript() {
    const deployScript = `#!/usr/bin/env node
/**
 * Auto-generated deployment script for QuizBurner
 * Network: ${this.config.network.toUpperCase()}
 * Generated: ${new Date().toISOString()}
 */

const { exec } = require('child_process');
const fs = require('fs');

async function deployQuizBurner() {
  console.log('🚀 Deploying QuizBurner to ${this.config.network.toUpperCase()}...');
  
  try {
    // Deploy contract
    console.log('Step 1: Deploying contract...');
    await execPromise('npm run deploy:${this.config.network === 'bsc-testnet' ? 'testnet' : this.config.network}');
    
    // Wait for deployment to complete
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Verify contract (if API key provided)
    if ('${this.config.bscscanApiKey}' !== 'YourBscscanAPIKey') {
      console.log('Step 2: Verifying contract...');
      await execPromise('npm run verify:${this.config.network === 'bsc-testnet' ? 'testnet' : this.config.network}');
    }
    
    // Setup treasury approval
    console.log('Step 3: Setting up treasury approval...');
    await execPromise('npm run treasury:approve');
    
    console.log('\\n🎉 QuizBurner deployment completed successfully!');
    console.log('Next steps:');
    console.log('1. Update QUIZ_BURNER_ADDRESS in .env.local with deployed address');
    console.log('2. Update NEXT_PUBLIC_QUIZ_BURNER_ADDRESS for frontend');
    console.log('3. Test the burn functionality');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  }
}

function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      console.log(stdout);
      resolve(stdout);
    });
  });
}

deployQuizBurner();
`;

    fs.writeFileSync(path.join(__dirname, 'deploy-quizburner.js'), deployScript);
    console.log('✅ Deployment script created: deploy-quizburner.js');
  }

  async showSummary() {
    console.log('\n🎯 Setup Summary:');
    console.log('================');
    console.log(`Network: ${this.config.network.toUpperCase()}`);
    console.log(`Chain ID: ${this.config.chainId}`);
    console.log(`Deployer: ${this.config.deployerAddress}`);
    console.log(`Treasury: ${this.config.treasuryAddress}`);
    console.log(`Burn Amount: ${this.config.burnAmount} tokens`);
    console.log(`Explorer: ${this.config.explorerBase}`);
    
    console.log('\n📋 Next Steps:');
    console.log('1. Review the generated .env.local file');
    console.log('2. Install dependencies: npm install');
    console.log('3. Deploy QuizBurner: node deploy-quizburner.js');
    console.log('4. Update contract addresses in .env.local');
    console.log('5. Test the burn functionality');
    
    console.log('\n⚠️  Important:');
    console.log('- Keep your private keys secure');
    console.log('- Test on testnet before mainnet');
    console.log('- Ensure wallets have sufficient gas fees');
    console.log('- Backup your .env.local file securely');
  }

  async run() {
    try {
      await this.gatherConfiguration();
      this.generateEnvFile();
      this.generateDeployScript();
      await this.showSummary();
    } catch (error) {
      console.error('❌ Setup failed:', error);
    } finally {
      rl.close();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new QuizBurnerSetup();
  setup.run();
}

module.exports = QuizBurnerSetup;