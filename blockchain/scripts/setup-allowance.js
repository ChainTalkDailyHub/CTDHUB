const { ethers } = require("hardhat");

async function main() {
    console.log("🔧 Configurando allowance do treasury...\n");
    
    // Endereços
    const CTD_TOKEN_ADDRESS = "0x7f890a4a575558307826C82e4cb6E671f3178bfc";
    const PROJECT_TREASURY_ADDRESS = "0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4";
    
    // Ler endereço do contrato burner do arquivo de deploy
    let QUIZ_BURNER_ADDRESS;
    try {
        const deployInfo = require('../deployment-info.json');
        QUIZ_BURNER_ADDRESS = deployInfo.contractAddress;
        console.log(`📍 Contrato Burner: ${QUIZ_BURNER_ADDRESS}`);
    } catch (error) {
        console.error("❌ Arquivo deployment-info.json não encontrado!");
        console.log("Execute primeiro: npm run deploy:burner");
        process.exit(1);
    }
    
    // Quantidade para allowance (suficiente para muitas queimas)
    const ALLOWANCE_AMOUNT = ethers.parseEther("1000000"); // 1M CTD
    
    console.log("📋 Configuração:");
    console.log(`├─ Token CTD: ${CTD_TOKEN_ADDRESS}`);
    console.log(`├─ Treasury: ${PROJECT_TREASURY_ADDRESS}`);
    console.log(`├─ Quiz Burner: ${QUIZ_BURNER_ADDRESS}`);
    console.log(`└─ Allowance: ${ethers.formatEther(ALLOWANCE_AMOUNT)} CTD\n`);
    
    // Obter signer (deve ser o treasury)
    const [signer] = await ethers.getSigners();
    console.log(`🔑 Signer: ${signer.address}`);
    
    if (signer.address.toLowerCase() !== PROJECT_TREASURY_ADDRESS.toLowerCase()) {
        console.warn("⚠️  ATENÇÃO: Signer não é o treasury!");
        console.warn("   Para configurar allowance, use a private key do treasury no .env.local");
    }
    
    try {
        // Conectar ao token CTD
        const tokenContract = await ethers.getContractAt("IERC20", CTD_TOKEN_ADDRESS);
        
        // Verificar saldo atual do treasury
        const balance = await tokenContract.balanceOf(PROJECT_TREASURY_ADDRESS);
        console.log(`💰 Saldo do treasury: ${ethers.formatEther(balance)} CTD`);
        
        if (balance < ethers.parseEther("1000")) {
            console.warn("⚠️  Saldo baixo no treasury para queimas!");
        }
        
        // Verificar allowance atual
        const currentAllowance = await tokenContract.allowance(
            PROJECT_TREASURY_ADDRESS, 
            QUIZ_BURNER_ADDRESS
        );
        console.log(`📊 Allowance atual: ${ethers.formatEther(currentAllowance)} CTD`);
        
        if (currentAllowance >= ALLOWANCE_AMOUNT) {
            console.log("✅ Allowance já configurado adequadamente!");
            return;
        }
        
        // Configurar allowance
        console.log("⏳ Configurando allowance...");
        const tx = await tokenContract.approve(QUIZ_BURNER_ADDRESS, ALLOWANCE_AMOUNT);
        console.log(`📝 Transaction hash: ${tx.hash}`);
        
        console.log("⏳ Aguardando confirmação...");
        const receipt = await tx.wait();
        console.log(`✅ Confirmado no bloco: ${receipt.blockNumber}`);
        
        // Verificar se allowance foi configurado
        const newAllowance = await tokenContract.allowance(
            PROJECT_TREASURY_ADDRESS, 
            QUIZ_BURNER_ADDRESS
        );
        
        console.log("\n🎉 ALLOWANCE CONFIGURADO COM SUCESSO!");
        console.log(`├─ Allowance anterior: ${ethers.formatEther(currentAllowance)} CTD`);
        console.log(`├─ Allowance atual: ${ethers.formatEther(newAllowance)} CTD`);
        console.log(`└─ Gas usado: ${receipt.gasUsed.toString()}\n`);
        
        // Testar se contrato pode fazer queima
        console.log("🧪 Testando configuração...");
        const burnerContract = await ethers.getContractAt("CTDQuizBurner", QUIZ_BURNER_ADDRESS);
        
        // Verificar stats
        const [totalBurned, totalUsers, treasuryBalance, allowance] = await burnerContract.getStats();
        
        console.log("📊 Status do contrato:");
        console.log(`├─ Total queimado: ${ethers.formatEther(totalBurned)} CTD`);
        console.log(`├─ Total usuários: ${totalUsers}`);
        console.log(`├─ Saldo treasury: ${ethers.formatEther(treasuryBalance)} CTD`);
        console.log(`└─ Allowance: ${ethers.formatEther(allowance)} CTD`);
        
        console.log("\n✅ Configuração completa! O contrato está pronto para usar.");
        
    } catch (error) {
        console.error("❌ Erro durante configuração:", error.message);
        
        // Diagnóstico de erro comum
        if (error.message.includes("ERC20InsufficientAllowance")) {
            console.log("💡 Dica: Execute este script com a private key do treasury");
        } else if (error.message.includes("insufficient funds")) {
            console.log("💡 Dica: Treasury precisa ter saldo BNB para pagar gas");
        }
        
        throw error;
    }
}

// Função auxiliar para verificar status
async function checkAllowanceStatus() {
    const CTD_TOKEN_ADDRESS = "0x7f890a4a575558307826C82e4cb6E671f3178bfc";
    const PROJECT_TREASURY_ADDRESS = "0x27f79d0a52F88D04e1d04875Fe55d6C23f514Ec4";
    
    try {
        const deployInfo = require('../deployment-info.json');
        const QUIZ_BURNER_ADDRESS = deployInfo.contractAddress;
        
        const tokenContract = await ethers.getContractAt("IERC20", CTD_TOKEN_ADDRESS);
        const allowance = await tokenContract.allowance(PROJECT_TREASURY_ADDRESS, QUIZ_BURNER_ADDRESS);
        const balance = await tokenContract.balanceOf(PROJECT_TREASURY_ADDRESS);
        
        console.log("📊 Status Atual:");
        console.log(`├─ Treasury Balance: ${ethers.formatEther(balance)} CTD`);
        console.log(`├─ Allowance: ${ethers.formatEther(allowance)} CTD`);
        console.log(`└─ Status: ${allowance > 0 ? "✅ Configurado" : "❌ Não configurado"}`);
        
        return { allowance, balance };
        
    } catch (error) {
        console.error("❌ Erro ao verificar status:", error.message);
        return null;
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main, checkAllowanceStatus };