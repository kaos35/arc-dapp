const hre = require("hardhat");

async function main() {
  const routerAddress = "0xDdACFF9260c66b2F0258F0B0E2ad992ca95d1e10";

  const Sub = await hre.ethers.getContractFactory("SubscriptionManager");
  const sub = await Sub.deploy(routerAddress);

  await sub.waitForDeployment();

  console.log("SubscriptionManager deployed to:", sub.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
