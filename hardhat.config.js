require("hardhat-deploy");
require("dotenv").config();
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.7" }, { version: "0.5.7" }, {version: "0.6.12"}],
  },
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      forking: {
        url: process.env.MAINNET_RPC_URL
      }
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL,
      accounts: [process.env.PRIVATE_KEY1],
      chainId: 5,
      allowUnlimitedContractSize: true,
      blockConformations: 5,
      gas: 5000000,
      gasPrice: 50000000000,
      allowUnlimitedContractSize: true,
    },
  },

  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
  mocha: {
    timeout: 300000,
  },
  etherscan: {
    apiKey: {
      goerli: process.env.ETHERSCAN_API_KEY,
    },
  }
}
