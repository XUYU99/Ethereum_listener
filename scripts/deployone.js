const { ethers, network } = require("hardhat");

async function main() {
  console.log(`Deploying contracts on network: ${network.name}`);

  const [deployer, accountb] = await ethers.getSigners();
  const deployerAddress = deployer.address;
  const accountbAddress = accountb.address;
  console.log(
    "Deploying contracts with account:",
    deployerAddress,
    accountbAddress
  );

  const kokoTokenAddress = await deployDao(deployerAddress, accountbAddress);
}

async function deployDao(deployerAddress, accountbAddress) {
  console.log(`-------------- Deploying DAO Contracts --------------`);

  // Deploy kokoToken Contract
  const KokoToken = await ethers.getContractFactory("kokoToken");
  const kokoToken = await KokoToken.deploy(deployerAddress, deployerAddress);
  await kokoToken.waitForDeployment();
  const kokoTokenAddress = await kokoToken.getAddress();
  console.log(`kokoToken deployed at: ${kokoTokenAddress}`);
  console.log(`-------------- Mint to AccountB --------------`);
  // Mint 操作
  const accountB = accountbAddress;

  let balance = await kokoToken.balanceOf(accountB);
  console.log(`AccountB balance: ${ethers.formatUnits(balance, 18)} tokens`);

  const mintAmount = ethers.parseUnits("5", 18); // Mint 100 代币，假设 decimals 为 18
  console.log(`Minting ${mintAmount.toString()} tokens to ${accountB}...`);
  const tx = await kokoToken.mint(accountB, mintAmount);
  await tx.wait();

  console.log("Mint transaction confirmed.");
  balance = await kokoToken.balanceOf(accountB);
  console.log(
    `after mint, AccountB balance: ${ethers.formatUnits(balance, 18)} tokens`
  );
  console.log(`-------------- deploy & mint complete --------------`);
  console.log(
    `yarn hardhat verify --network sepolia ${kokoTokenAddress} "0xe409121c12E6d748d29c132BE68552Bdc8162a81" "0xe409121c12E6d748d29c132BE68552Bdc8162a81"`
  );

  return kokoTokenAddress;
}

main().catch((error) => {
  console.error("Error deploying contracts:", error);
  process.exitCode = 1;
});
