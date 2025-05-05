require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY", // or Alchemy endpoint
      accounts: ["0xYOUR_REAL_PRIVATE_KEY"]
    }
  }
};  