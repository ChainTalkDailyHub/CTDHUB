require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require('dotenv').config({ path: '.env.local' });

const PRIVATE_KEY = process.env.PRIVATE_KEY_DEPLOYER || process.env.ADMIN_PRIVATE_KEY;
const BSC_RPC = process.env.RPC_BSC || "https://bsc-dataseed.binance.org/";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || process.env.BSCSCAN_API;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || process.env.ETHERSCAN_API;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,
    },
  },
  
  networks: {
    hardhat: {
      // Configuração para testes locais
      chainId: 31337,
      gas: 12000000,
      gasPrice: 20000000000,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        count: 10,
        accountsBalance: "10000000000000000000000" // 10k ETH
      }
    },
    
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    
    bsc: {
      url: BSC_RPC,
      chainId: 56,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 100000,                    // Gas limit otimizado
      gasPrice: 1000000000,           // 1 Gwei (MÍNIMO ABSOLUTO)
      timeout: 300000,                // 5 minutos para confirmação
    },
    
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
      gas: 100000,
      gasPrice: 1000000000,           // 1 Gwei (mínimo também na testnet)
      timeout: 300000,
    }
  },
  
  etherscan: {
    apiKey: ETHERSCAN_API_KEY, // Usar a API key v2 unificada
    customChains: [
      {
        network: "bsc",
        chainId: 56,
        urls: {
          apiURL: "https://api.etherscan.io/v2/api?chainid=56",
          browserURL: "https://bscscan.com"
        }
      }
    ]
  },
  
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  
  mocha: {
    timeout: 40000
  },
  
  paths: {
    sources: "./blockchain/contracts",
    tests: "./blockchain/tests",
    cache: "./blockchain/cache",
    artifacts: "./blockchain/artifacts"
  }
};