const hre = require("hardhat");
const fs = require("node:fs");
const path = require("node:path");

async function main() {
  const { ethers, network } = hre;

  console.log("============================================================");
  console.log("  TravelVerse Pass — Smart Contracts Deployment");
  console.log("============================================================");
  console.log(`Network:   ${network.name} (chainId: ${network.config.chainId})`);

  const [deployer] = await ethers.getSigners();
  console.log(`Deployer:  ${deployer.address}`);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Balance:   ${ethers.formatEther(balance)} MATIC`);

  if (balance === 0n) {
    console.warn(
      "\n[WARNING] Balance 0 MATIC — claim faucet dulu di " +
        "https://faucet.polygon.technology/"
    );
  }

  // --------------------------------------------------------------------
  // 1. TouristPass (ERC-721)
  // --------------------------------------------------------------------
  console.log("\n[1/3] Deploying TouristPass...");
  const TouristPass = await ethers.getContractFactory("TouristPass");
  const touristPass = await TouristPass.deploy();
  await touristPass.waitForDeployment();
  const touristPassAddress = await touristPass.getAddress();
  console.log(`      OK → ${touristPassAddress}`);

  // --------------------------------------------------------------------
  // 2. DestinationBadge (ERC-721)
  // --------------------------------------------------------------------
  console.log("\n[2/3] Deploying DestinationBadge...");
  const DestinationBadge = await ethers.getContractFactory(
    "DestinationBadge"
  );
  const destinationBadge = await DestinationBadge.deploy();
  await destinationBadge.waitForDeployment();
  const destinationBadgeAddress = await destinationBadge.getAddress();
  console.log(`      OK → ${destinationBadgeAddress}`);

  // --------------------------------------------------------------------
  // 3. RewardToken (ERC-20)
  // --------------------------------------------------------------------
  console.log("\n[3/3] Deploying RewardToken...");
  const RewardToken = await ethers.getContractFactory("RewardToken");
  const rewardToken = await RewardToken.deploy();
  await rewardToken.waitForDeployment();
  const rewardTokenAddress = await rewardToken.getAddress();
  console.log(`      OK → ${rewardTokenAddress}`);

  // --------------------------------------------------------------------
  // Summary + persist ke deployments/<network>.json
  // --------------------------------------------------------------------
  const deployments = {
    network: network.name,
    chainId: network.config.chainId,
    deployer: deployer.address,
    deployedAt: new Date().toISOString(),
    contracts: {
      TouristPass: touristPassAddress,
      DestinationBadge: destinationBadgeAddress,
      RewardToken: rewardTokenAddress,
    },
  };

  const outDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${network.name}.json`);
  fs.writeFileSync(outFile, JSON.stringify(deployments, null, 2));

  console.log("\n============================================================");
  console.log("  DEPLOYMENT SUMMARY");
  console.log("============================================================");
  console.log(`TouristPass:       ${touristPassAddress}`);
  console.log(`DestinationBadge:  ${destinationBadgeAddress}`);
  console.log(`RewardToken:       ${rewardTokenAddress}`);
  console.log(`\nSaved to: deployments/${network.name}.json`);

  console.log("\n============================================================");
  console.log("  COPY INI KE .env (& share ke tim FE)");
  console.log("============================================================");
  console.log(`TOURIST_PASS_ADDRESS=${touristPassAddress}`);
  console.log(`BADGE_ADDRESS=${destinationBadgeAddress}`);
  console.log(`TOKEN_ADDRESS=${rewardTokenAddress}`);

  if (network.name === "amoy") {
    console.log("\n============================================================");
    console.log("  VERIFY DI POLYGONSCAN (optional)");
    console.log("============================================================");
    console.log(`npx hardhat verify --network amoy ${touristPassAddress}`);
    console.log(`npx hardhat verify --network amoy ${destinationBadgeAddress}`);
    console.log(`npx hardhat verify --network amoy ${rewardTokenAddress}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
