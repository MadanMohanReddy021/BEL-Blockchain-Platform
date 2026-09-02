import hre from "hardhat";

async function main() {
  const { ethers } = await hre.network.connect();

  const BELPlatform =
    await ethers.getContractFactory("BELPlatform");

  const belPlatform =
    await BELPlatform.deploy();

  await belPlatform.waitForDeployment();

  console.log(
    "BELPlatform deployed to:",
    await belPlatform.getAddress()
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});