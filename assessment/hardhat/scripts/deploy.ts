import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer:", deployer.address);

  const admin = deployer.address;
  const initialWriter = deployer.address; // ajuste se quiser

  const F = await ethers.getContractFactory("CTDHUB_BINNOAI");
  const c = await F.deploy(admin, initialWriter);
  await c.waitForDeployment();
  const address = await c.getAddress();
  console.log("CTDHUB_BINNOAI deployed to:", address);
}

main().catch((e) => { console.error(e); process.exit(1); });