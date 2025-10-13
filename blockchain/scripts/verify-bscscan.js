const hre = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🔍 VERIFICAÇÃO DO CONTRATO NO BSCSCAN\n");
    
    try {
        // Ler informações do deploy
        const deployInfo = JSON.parse(fs.readFileSync('./blockchain/deployment-info.json', 'utf8'));
        const contractAddress = deployInfo.contractAddress;
        
        console.log(`📍 Contrato: ${contractAddress}`);
        console.log(`🏗️ Nome: CTDQuizBurner`);
        console.log(`📅 Deploy: ${deployInfo.deployedAt}\n`);
        
        // Argumentos do construtor
        const constructorArgs = [
            deployInfo.ctdToken,      // _ctdToken
            deployInfo.projectTreasury // _projectTreasury
        ];
        
        console.log("📋 Argumentos do construtor:");
        console.log(`├─ CTD Token: ${constructorArgs[0]}`);
        console.log(`└─ Treasury: ${constructorArgs[1]}\n`);
        
        console.log("⏳ Iniciando verificação no BSCScan...");
        
        // Verificar contrato
        await hre.run("verify:verify", {
            address: contractAddress,
            constructorArguments: constructorArgs,
            contract: "blockchain/contracts/CTDQuizBurner.sol:CTDQuizBurner"
        });
        
        console.log("\n✅ VERIFICAÇÃO CONCLUÍDA COM SUCESSO!");
        console.log(`🔗 Link: https://bscscan.com/address/${contractAddress}#code`);
        
    } catch (error) {
        if (error.message.includes("Already Verified")) {
            console.log("✅ Contrato já está verificado no BSCScan!");
            
            const deployInfo = JSON.parse(fs.readFileSync('./blockchain/deployment-info.json', 'utf8'));
            console.log(`🔗 Link: https://bscscan.com/address/${deployInfo.contractAddress}#code`);
        } else {
            console.error("❌ Erro na verificação:", error.message);
            
            // Dicas para resolver erros comuns
            console.log("\n💡 DICAS PARA RESOLVER:");
            console.log("1. Verifique se a API key está correta");
            console.log("2. Aguarde alguns minutos após o deploy");
            console.log("3. Certifique-se que o contrato foi deployado");
            console.log("4. Verifique se os argumentos do construtor estão corretos");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });