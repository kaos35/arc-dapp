require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    arc: {
      url: "https://rpc.testnet.arc.network/", 
      accounts: ["0x6bff5697662610a23073ea0e2d4564e2ac9ae966b222733e866cad53bf222efc"],
    },
  },
};
