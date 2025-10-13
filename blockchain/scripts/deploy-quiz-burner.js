const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
    console.log("🚀 Iniciando deploy do CTDQuizBurner...\n");
    
    // Configurações do contrato
    const CTD_TOKEN_ADDRESS = "0x7f890a4a575558307826C82e4cb6E671f3178bfc";
    const PROJECT_TREASURY_ADDRESS = "0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4";
    
    // Debug configuração
    console.log("🔍 Debug - Network e Config:");
    console.log(`├─ Network: ${hre.network.name}`);
    console.log(`├─ Private Key existe: ${process.env.ADMIN_PRIVATE_KEY ? 'Sim' : 'Não'}`);
    
    // Obter signer (deployer)
    const signers = await ethers.getSigners();
    console.log(`├─ Signers encontrados: ${signers.length}`);
    
    if (signers.length === 0) {
        throw new Error("❌ Nenhum signer encontrado. Verifique PRIVATE_KEY no .env.local");
    }
    
    const deployer = signers[0];
    console.log("\n📋 Informações do Deploy:");
    console.log(`├─ Deployer: ${deployer.address}`);
    console.log(`├─ CTD Token: ${CTD_TOKEN_ADDRESS}`);
    console.log(`└─ Treasury: ${PROJECT_TREASURY_ADDRESS}\n`);
    
    // Verificar saldo do deployer
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log(`💰 Saldo do deployer: ${ethers.formatEther(balance)} BNB\n`);
    
    if (balance < ethers.parseEther("0.005")) {
        throw new Error("❌ Saldo insuficiente para deploy (mínimo 0.005 BNB com taxa 1 Gwei)");
    }
    
    try {
        // Deploy do contrato
        console.log("⏳ Fazendo deploy do contrato...");
        const CTDQuizBurner = await ethers.getContractFactory("CTDQuizBurner");
        
        const contract = await CTDQuizBurner.deploy(
            CTD_TOKEN_ADDRESS,
            PROJECT_TREASURY_ADDRESS
        );
        
        console.log("⏳ Aguardando confirmação na blockchain...");
        await contract.waitForDeployment();
        
        const contractAddress = await contract.getAddress();
        console.log(`✅ Contrato deployado com sucesso!`);
        console.log(`📍 Endereço: ${contractAddress}\n`);
        
        // Verificar se o contrato foi deployado corretamente
        console.log("🔍 Verificando contrato...");
        const code = await ethers.provider.getCode(contractAddress);
        if (code === '0x') {
            throw new Error("❌ Contrato não foi deployado corretamente");
        }
        
        // Testar funções básicas
        const ctdToken = await contract.ctdToken();
        const projectTreasury = await contract.projectTreasury();
        const burnAmount = await contract.BURN_AMOUNT();
        const owner = await contract.owner();
        
        console.log("📊 Configurações do contrato:");
        console.log(`├─ CTD Token: ${ctdToken}`);
        console.log(`├─ Treasury: ${projectTreasury}`);
        console.log(`├─ Burn Amount: ${ethers.formatEther(burnAmount)} CTD`);
        console.log(`└─ Owner: ${owner}\n`);
        
        // Verificar allowance do treasury
        const tokenContract = await ethers.getContractAt("IERC20", CTD_TOKEN_ADDRESS);
        const allowance = await tokenContract.allowance(PROJECT_TREASURY_ADDRESS, contractAddress);
        const treasuryBalance = await tokenContract.balanceOf(PROJECT_TREASURY_ADDRESS);
        
        console.log("💳 Status do Treasury:");
        console.log(`├─ Saldo: ${ethers.formatEther(treasuryBalance)} CTD`);
        console.log(`├─ Allowance: ${ethers.formatEther(allowance)} CTD`);
        console.log(`└─ Status: ${allowance >= burnAmount ? "✅ OK" : "❌ Precisa de allowance"}\n`);
        
        // Salvar informações do deploy
        const deployInfo = {
            contractAddress: contractAddress,
            deployer: deployer.address,
            ctdToken: CTD_TOKEN_ADDRESS,
            projectTreasury: PROJECT_TREASURY_ADDRESS,
            burnAmount: ethers.formatEther(burnAmount),
            deployedAt: new Date().toISOString(),
            network: "BSC Mainnet",
            chainId: 56,
            transactionHash: contract.deploymentTransaction()?.hash || "N/A",
            blockNumber: await ethers.provider.getBlockNumber(),
            gasUsed: "TBD" // Será preenchido após verificação
        };
        
        // Salvar em arquivo JSON
        const deployFilePath = path.join(__dirname, '../deployment-info.json');
        fs.writeFileSync(deployFilePath, JSON.stringify(deployInfo, null, 2));
        
        console.log("📄 Informações salvas em:", deployFilePath);
        
        // Instruções pós-deploy
        console.log("\n🎯 PRÓXIMOS PASSOS:");
        console.log("1. Configurar allowance do treasury:");
        console.log(`   - Treasury deve aprovar ${ethers.formatEther(burnAmount)} CTD para: ${contractAddress}`);
        console.log("2. Atualizar .env.local com novo endereço:");
        console.log(`   - QUIZ_BURNER_ADDRESS=${contractAddress}`);
        console.log(`   - NEXT_PUBLIC_QUIZ_BURNER_ADDRESS=${contractAddress}`);
        console.log("3. Verificar contrato no BSCScan");
        console.log("4. Testar função de queima\n");
        
        return {
            contractAddress,
            deployInfo
        };
        
    } catch (error) {
        console.error("❌ Erro durante o deploy:", error.message);
        throw error;
    }
}

// Função para verificar o contrato após deploy
async function verifyContract(contractAddress) {
    console.log(`🔍 Iniciando verificação do contrato ${contractAddress}...\n`);
    
    try {
        const contract = await ethers.getContractAt("CTDQuizBurner", contractAddress);
        
        // Testes básicos
        const tests = [
            { name: "CTD Token", func: () => contract.ctdToken() },
            { name: "Project Treasury", func: () => contract.projectTreasury() },
            { name: "Burn Amount", func: () => contract.BURN_AMOUNT() },
            { name: "Owner", func: () => contract.owner() },
            { name: "Total Burned", func: () => contract.totalBurned() },
            { name: "Total Users", func: () => contract.totalUsers() }
        ];
        
        for (const test of tests) {
            try {
                const result = await test.func();
                console.log(`✅ ${test.name}: ${result}`);
            } catch (error) {
                console.log(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        console.log("\n✅ Verificação concluída!");
        
    } catch (error) {
        console.error("❌ Erro na verificação:", error.message);
    }
}

// Executar apenas se chamado diretamente
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main, verifyContract };