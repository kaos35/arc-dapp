const hre = require("hardhat");

async function main() {
  const Router = await hre.ethers.getContractFactory("PaymentRouter");
  const router = await Router.deploy();

  await router.waitForDeployment();

  console.log("PaymentRouter deployed to:", router.target);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
