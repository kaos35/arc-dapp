require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true, // ⭐ Stack too deep çözümü
    },
  },

  networks: {
    arc: {
      url: "https://rpc-testnet.arc.net",   // Arc testnet RPC (senin kullandığın)
      accounts: [process.env.PRIVATE_KEY],  // .env dosyasındaki private key
    },
  },
};
