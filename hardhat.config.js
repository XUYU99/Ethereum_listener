require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SEPOLIA_RPC_URL =
  process.env.SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/your-api-key";
const PRIVATE_KEY0 = process.env.PRIVATE_KEY0 || "0xYourPrivateKey";
const PRIVATE_KEY1 = process.env.PRIVATE_KEY1 || "0xYourPrivateKey";
const PRIVATE_KEY2 = process.env.PRIVATE_KEY2 || "0xYourPrivateKey";
const ETHERSCAN_API_KEY =
  process.env.ETHERSCAN_API_KEY || "YourEtherscanAPIKey";

module.exports = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 1000,
      },
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY0, PRIVATE_KEY1, PRIVATE_KEY2],
      chainId: 11155111,
    },
    localhost: {
      url: "http://127.0.0.1:8545/",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: ETHERSCAN_API_KEY,
    },
    customChains: [
      {
        network: "sepolia",
        chainId: 11155111,
        urls: {
          apiURL: "https://api-sepolia.etherscan.io/api",
          browserURL: "https://sepolia.etherscan.io",
        },
      },
    ],
  },
  sourcify: {
    // Disabled by default
    // Doesn't need an API key
    enabled: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    admin: {
      default: 1,
    },
    user: {
      default: 2,
    },
  },
  mocha: {
    timeout: 200000,
  },
};
