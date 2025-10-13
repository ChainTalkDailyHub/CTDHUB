import { run } from "hardhat";

async function main() {
  const address = process.env.CONTRACT_ADDRESS!;
  const admin = process.env.ADMIN_ADDRESS!;
  const initialWriter = process.env.INIT_WRITER_ADDRESS || admin;

  await run("verify:verify", {
    address,
    constructorArguments: [admin, initialWriter],
    contract: "contracts/CTDHUB_BINNOAI.sol:CTDHUB_BINNOAI"
  });
  console.log("Verified on BscScan as CTDHUB-BINNOAI (contract name).");
}

main().catch((e) => { console.error(e); process.exit(1); });