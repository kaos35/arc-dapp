// scripts/deploy-allowance.cjs
const { ethers } = require("hardhat");

async function main() {
  const routerAddress = "0x2e2A46833Db890737CE735e8C86F424AE30101Ff"; // PaymentRouter adresin

  console.log("Deploying AllowanceVault...");

  const AllowanceVault = await ethers.getContractFactory("AllowanceVault");
  const allowance = await AllowanceVault.deploy(routerAddress);

  await allowance.waitForDeployment();

  console.log("AllowanceVault deployed to:", await allowance.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
