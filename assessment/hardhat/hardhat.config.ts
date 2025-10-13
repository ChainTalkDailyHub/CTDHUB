import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const PK = process.env.PRIVATE_KEY!;
const BSC_RPC = process.env.BSC_RPC || "https://bsc-dataseed.binance.org";
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY || "";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.24",
    settings: { optimizer: { enabled: true, runs: 200 } }
  },
  networks: {
    bsc: {
      url: BSC_RPC,
      chainId: 56,
      accounts: PK ? [PK] : []
    }
  },
  etherscan: {
    apiKey: BSCSCAN_API_KEY
  }
};
export default config;