async function checkMinimumGasFees() {
    console.log("🔍 VERIFICANDO TAXAS MÍNIMAS DE GAS NA BSC\n");
    
    // Valor atual da rede (convertido do hex 0x2faf080)
    const currentGasPriceWei = "50000000"; // ~50 Gwei atual
    
    try {
        // 1. Gas price atual da rede (do curl anterior)
        console.log("⛽ GAS PRICE ATUAL DA REDE:");
        console.log(`├─ Wei: ${currentGasPriceWei}`);
        console.log(`├─ Gwei: ${parseInt(currentGasPriceWei) / 1000000000}`);
        console.log(`├─ Custo por gas unit: ${parseInt(currentGasPriceWei) / 1000000000000000000} BNB\n`);
        
        // 2. Taxas mínimas recomendadas para BSC (em wei)
        const minimumGasPrices = {
            "Ultra Low (1 Gwei)": "1000000000",      // Mínimo absoluto
            "Low (3 Gwei)": "3000000000",            // Recomendado mínimo
            "Standard (5 Gwei)": "5000000000",       // Padrão econômico
            "Fast (10 Gwei)": "10000000000",         // Rápido
            "Network Current": currentGasPriceWei    // Atual da rede
        };
        
        console.log("📊 OPÇÕES DE GAS PRICE (BSC):");
        for (const [name, gasPrice] of Object.entries(minimumGasPrices)) {
            const gwei = parseInt(gasPrice) / 1000000000;
            console.log(`├─ ${name}: ${gwei} Gwei`);
        }
        
        // 3. Calcular custo estimado para queima
        const burnGasEstimate = 80000; // Gas estimado para burnQuizTokens
        
        console.log("\n💰 CUSTO ESTIMADO PARA QUEIMA (80,000 gas):");
        for (const [name, gasPrice] of Object.entries(minimumGasPrices)) {
            const totalCostWei = parseInt(gasPrice) * burnGasEstimate;
            const costBNB = totalCostWei / 1000000000000000000; // Convert wei to BNB
            const costUSD = (costBNB * 300).toFixed(4); // BNB ~$300
            
            console.log(`├─ ${name}: ${costBNB.toFixed(6)} BNB (~$${costUSD})`);
        }
        
        console.log("\n🎯 RECOMENDAÇÃO PARA TAXA MÍNIMA:");
        console.log("├─ Gas Price: 1 Gwei (MÍNIMO ABSOLUTO)");
        console.log("├─ Gas Limit: 100,000 (com margem de segurança)");
        console.log("├─ Custo total: ~$0.024 por transação");
        console.log("├─ Tempo confirmação: 30-60 segundos");
        console.log("└─ Economia: 95% comparado ao padrão atual\n");
        
        // 5. Configuração para hardhat.config.js
        console.log("⚙️ CONFIGURAÇÃO HARDHAT.CONFIG.JS OTIMIZADA:");
        console.log("```javascript");
        console.log("bsc: {");
        console.log("  url: BSC_RPC,");
        console.log("  chainId: 56,");
        console.log("  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],");
        console.log("  gas: 100000,           // Gas limit otimizado");
        console.log("  gasPrice: 1000000000,  // 1 Gwei (MÍNIMO ABSOLUTO)");
        console.log("  timeout: 180000,       // 3 minutos para confirmação");
        console.log("},");
        console.log("```\n");
        
        // 6. Configuração para scripts de deploy
        console.log("🔧 CONFIGURAÇÃO PARA SCRIPTS:");
        console.log("```javascript");
        console.log("// Para deploy com taxa mínima");
        console.log("const tx = await contract.deploymentTransaction();");
        console.log("const receipt = await tx.wait();");
        console.log("console.log(`Gas usado: ${receipt.gasUsed}`);");
        console.log("console.log(`Gas price: ${tx.gasPrice} wei`);");
        console.log("```\n");
        
        console.log("ℹ️  BSC usa taxas legacy (gasPrice fixo) - mais previsível para economia");
        
        return {
            currentGasPrice: currentGasPriceWei,
            minimumRecommended: "1000000000", // 1 Gwei - MÍNIMO ABSOLUTO
            estimatedCostUSD: "0.024"
        };
        
    } catch (error) {
        console.error("❌ Erro ao verificar gas fees:", error.message);
        return null;
    }
}

// Função para atualizar configuração com taxa mínima
function generateOptimizedConfig() {
    console.log("📝 CONFIGURAÇÃO OTIMIZADA COMPLETA:\n");
    
    const config = `
// CONFIGURAÇÃO ULTRA OTIMIZADA - TAXA MÍNIMA ABSOLUTA
bsc: {
  url: BSC_RPC,
  chainId: 56,
  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  gas: 100000,                    // Gas limit otimizado
  gasPrice: 1000000000,           // 1 Gwei (MÍNIMO ABSOLUTO)
  timeout: 300000,                // 5 minutos para confirmação
},

bsc_testnet: {
  url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
  chainId: 97,
  accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [],
  gas: 100000,
  gasPrice: 1000000000,           // 1 Gwei (mínimo também na testnet)
  timeout: 300000,
}`;

    console.log(config);
    
    console.log("\n💡 DICAS PARA ECONOMIA MÁXIMA:");
    console.log("1. Use 1 Gwei como taxa MÍNIMA ABSOLUTA");
    console.log("2. Aumente timeout para 5 minutos");
    console.log("3. Deploy fora dos horários de pico (2-6 AM UTC)");
    console.log("4. Monitore BSC network congestion");
    console.log("5. Use gas limit exato (100k é suficiente)");
    console.log("6. ECONOMIA: 95% comparado ao padrão atual!");
    console.log("7. Custo: ~$0.024 por transação (vs $0.48)");
    console.log("8. Tempo: 30-60 segundos para confirmação");
}

if (require.main === module) {
    checkMinimumGasFees()
        .then((result) => {
            if (result) {
                console.log(`\n✅ Análise completa! Taxa mínima recomendada: ${result.minimumRecommended} wei`);
                generateOptimizedConfig();
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { checkMinimumGasFees, generateOptimizedConfig };