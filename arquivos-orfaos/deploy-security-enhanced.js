const { ethers } = require("hardhat");

async function main() {
    console.log("🚀 Deploying CTDHUBQuizBurner (Security Enhanced Version)...\n");

    // Parâmetros do contrato (com checksum correto)
    const CTD_TOKEN = "0x7f890a4a575558307826c82e4cb6e671f3178bfc";
    const TREASURY = "0x27f79d0a52f88d04e1d04875fe55d6c23f514ec4";
    const BURN_AMOUNT = ethers.parseEther("1000"); // 1000 CTD
    const INITIAL_OWNER = "0x27f79d0a52f88d04e1d04875fe55d6c23f514ec4";

    console.log("📋 Deploy Parameters:");
    console.log(`   CTD Token: ${CTD_TOKEN}`);
    console.log(`   Treasury: ${TREASURY}`);
    console.log(`   Burn Amount: ${ethers.formatEther(BURN_AMOUNT)} CTD`);
    console.log(`   Initial Owner: ${INITIAL_OWNER}\n`);

    try {
        // Deploy do contrato
        const CTDHUBQuizBurner = await ethers.getContractFactory("CTDHUBQuizBurner");
        
        console.log("⏳ Deploying contract...");
        const contract = await CTDHUBQuizBurner.deploy(
            CTD_TOKEN,
            TREASURY,
            BURN_AMOUNT,
            INITIAL_OWNER
        );

        await contract.waitForDeployment();
        const contractAddress = await contract.getAddress();

        console.log("✅ CTDHUBQuizBurner deployed successfully!");
        console.log(`📍 Contract Address: ${contractAddress}`);
        console.log(`🔗 BSCScan: https://bscscan.com/address/${contractAddress}\n`);

        // Verificar configurações iniciais
        console.log("🔍 Verifying initial configuration...");
        
        const ctdToken = await contract.ctdToken();
        const treasury = await contract.treasury();
        const burnAmount = await contract.burnAmount();
        const owner = await contract.owner();
        const paused = await contract.paused();

        console.log(`   CTD Token: ${ctdToken} ✅`);
        console.log(`   Treasury: ${treasury} ✅`);
        console.log(`   Burn Amount: ${ethers.formatEther(burnAmount)} CTD ✅`);
        console.log(`   Owner: ${owner} ✅`);
        console.log(`   Paused: ${paused} ✅\n`);

        // Verificar allowance do treasury
        console.log("💰 Checking treasury allowance...");
        const allowance = await contract.getTreasuryAllowance();
        console.log(`   Current Allowance: ${ethers.formatEther(allowance)} CTD`);
        
        if (allowance === 0n) {
            console.log("⚠️  WARNING: Treasury has no allowance set!");
            console.log("   Please approve CTD tokens for the contract:");
            console.log(`   ctdToken.approve("${contractAddress}", "1000000000000000000000000"); // 1M CTD\n`);
        } else {
            console.log("✅ Treasury allowance is set\n");
        }

        // Informações para BSCScan verification
        console.log("📝 BSCScan Verification Info:");
        console.log("   Compiler: Solidity 0.8.24");
        console.log("   Optimization: Enabled (200 runs)");
        console.log("   Constructor Arguments (ABI-encoded):");
        
        const abiCoder = ethers.AbiCoder.defaultAbiCoder();
        const encodedArgs = abiCoder.encode(
            ["address", "address", "uint256", "address"],
            [CTD_TOKEN, TREASURY, BURN_AMOUNT, INITIAL_OWNER]
        );
        console.log(`   ${encodedArgs.slice(2)}\n`); // Remove 0x prefix

        // Instruções finais
        console.log("🎯 Next Steps:");
        console.log("1. Verify contract on BSCScan");
        console.log("2. Set treasury allowance (if needed)");
        console.log("3. Update frontend with new contract address");
        console.log("4. Test all functions thoroughly");
        console.log("\n✨ Deployment completed successfully!");

        return {
            contractAddress,
            ctdToken: CTD_TOKEN,
            treasury: TREASURY,
            burnAmount: BURN_AMOUNT.toString(),
            owner: INITIAL_OWNER
        };

    } catch (error) {
        console.error("❌ Deployment failed:", error.message);
        throw error;
    }
}

// Execute deployment
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = main;