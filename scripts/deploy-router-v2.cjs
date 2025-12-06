const { ethers } = require("hardhat");

async function main() {
  const allowance = "0xCD98FF8Fa4e90182AA72E34aB0eeB7D1578E42C5"; // AllowanceVault adresi

  console.log("Deploying PaymentRouter V2...");

  const Router = await ethers.getContractFactory("PaymentRouter");
  const router = await Router.deploy(allowance);

  await router.waitForDeployment();

  console.log("PaymentRouter V2 deployed to:", await router.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
